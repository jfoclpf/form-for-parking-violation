var CordovaExif = (function () {

	var Exif, FileHandle, BinaryImage;

	FileHandle = {
		url: null,
		callback: null,
		getExif: false,

		setup: function(imageURI, callback, getExif) {
			FileHandle.url = imageURI;
			FileHandle.callback = callback;

			if(getExif){
				FileHandle.getExif = getExif;
			}

			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, FileHandle.gotFS, FileHandle.fail);
		},

		readData: function(imageURI, callback){
			FileHandle.setup(imageURI, callback, true);
		},

		readBase64: function(imageURI, callback){
			FileHandle.setup(imageURI, callback, false);
		},

		gotFS: function(fileSystem) {
			window.resolveLocalFileSystemURL(FileHandle.url, FileHandle.gotFileEntry, FileHandle.fail);
		},

		gotFileEntry: function(fileEntry) {
			fileEntry.file(FileHandle.readFile, FileHandle.fail);
		},

		fail: function(error) {
			// error.code
		},

		readFile: function(file){
			var fileReader = new FileReader();
			fileReader.onload = FileHandle.readFileSuccess;
			fileReader.readAsBinaryString(file);
		},

		readFileSuccess: function(e){
			var binaryImage,
				binTarget = e.target.result;

			if(!FileHandle.getExif){
				FileHandle.callback(window.btoa(binTarget));
				return false;
			}

			binaryImage = new BinaryImage(binTarget);
			FileHandle.handleBinaryImage(binaryImage);
		},

		handleBinaryImage: function(binaryImage){
			var exifObject = Exif.find(binaryImage);
			FileHandle.callback(exifObject);
		}
	};

	Exif = {
		find: function(image){
			// Check if is a valid JPEG
			if (image.getByteAt(0) !== 0xFF || image.getByteAt(1) !== 0xD8) return false;

			var offset = 2;
			while (offset < image.length) {
				if (image.getByteAt(offset) === 0xFF) {
					// Check if is a EXIF marker
					if (image.getByteAt(offset + 1) === 0xE1)
						return Exif.read(image, offset + 4);
					offset += 2;
				} else ++offset;
			}
			return false;
		},

		read: function(image, start){

			var tag,
				tags,
				gpsData,
				exifData,
				bigEndian,
				exifOffset = start + 6;


			// Check if is a valid EXIF data
			if (image.getStringAt(start, 4) !== 'Exif') {
				return false;
			}


			// May be 0x4949 or 0x4D4D to be valid
			if (image.getShortAt(exifOffset) === 0x4949) {
				bigEndian = false;
			}
			else if (image.getShortAt(exifOffset) === 0x4D4D) {
				bigEndian = true;
			}
			else {
				return false;
			}


			// May be 0x4949 or 0x002A to be valid
			if (image.getShortAt(exifOffset + 2, bigEndian) !== 0x002A) {
				return false;
			}


			// First offset may be 8
			if (image.getLongAt(exifOffset + 4, bigEndian) !== 0x00000008) {
				return false;
			}


			tags = Exif.readTags(image, exifOffset, exifOffset+8, Exif.StringTags, bigEndian);


			if (tags.ExifIFDPointer) {
				exifData = Exif.readTags(image, exifOffset, exifOffset + tags.ExifIFDPointer, Exif.StringTags, bigEndian);

				for (tag in exifData) {

					switch (tag) {
						case 'LightSource':
						case 'Flash':
						case 'MeteringMode':
						case 'ExposureProgram':
						case 'SensingMethod':
						case 'SceneCaptureType':
						case 'SceneType':
						case 'CustomRendered':
						case 'WhiteBalance':
						case 'GainControl':
						case 'Contrast':
						case 'Saturation':
						case 'Sharpness':
						case 'SubjectDistanceRange':
						case 'FileSource':
							exifData[tag] = Exif.StringValues[tag][exifData[tag]];
							break;

						case 'ExifVersion':
						case 'FlashpixVersion':
							exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
							break;

						case 'ComponentsConfiguration':
							exifData[tag] =
							Exif.StringValues.Components[exifData[tag][0]] +
							Exif.StringValues.Components[exifData[tag][1]] +
							Exif.StringValues.Components[exifData[tag][2]] +
							Exif.StringValues.Components[exifData[tag][3]];
							break;

					}

					tags[tag] = exifData[tag];
				}
			}

			if (tags.GPSInfoIFDPointer) {
				gpsData = Exif.readTags(image, exifOffset, exifOffset + tags.GPSInfoIFDPointer, Exif.GPSTags, bigEndian);

				for (tag in gpsData) {
					switch (tag) {
						case 'GPSVersionID' :
							gpsData[tag] = gpsData[tag][0] + '.' + gpsData[tag][1] + '.' + gpsData[tag][2] + '.' + gpsData[tag][3];
							break;
					}
					tags[tag] = gpsData[tag];
				}

			}

			return tags;
		},

		readTags: function(image, exifStart, dirStart, strings, bigEndian){
			var tag,
				tags = {},
				entryOffset,
				entries = image.getShortAt(dirStart, bigEndian);

			for (var i=0; i<entries; i++) {
				entryOffset = dirStart + i * 12 + 2;
				tag = strings[image.getShortAt(entryOffset, bigEndian)];

				if (tag){
					tags[tag] = Exif.readTagValue(image, entryOffset, exifStart, dirStart, bigEndian);
				}
			}

			return tags;
		},

		readTagValue: function(file, entryOffset, exifStart, dirStart, bigEndian) {
			var n,
				val,
				vals,
				data,
				type,
				offset,
				numValues,
				numerator,
				valueOffset,
				denominator;

			type = file.getShortAt(entryOffset+2, bigEndian);
			numValues = file.getLongAt(entryOffset+4, bigEndian);
			valueOffset = file.getLongAt(entryOffset+8, bigEndian) + exifStart;

			switch (type) {

				// 1 = Byte, 8-bit unsigned int;
				// 7 = undefined, 8-bit byte, value depending on field;
				case 1:
				case 7:
					if (numValues === 1) {
						data = file.getByteAt(entryOffset + 8, bigEndian);
					} else {
						offset = numValues > 4 ? valueOffset : (entryOffset + 8);
						vals = [];
						for (n=0;n<numValues;n++) {
							vals[n] = file.getByteAt(offset + n);
						}
						data = vals;
					}
					break;


				// 2 = ascii, 8-bit byte;
				case 2:
					offset = numValues > 4 ? valueOffset : (entryOffset + 8);
					data = file.getStringAt(offset, numValues-1);
					break;


				// 3 = short, 16 bit int;
				case 3:
					if (numValues === 1) {
						data = file.getShortAt(entryOffset + 8, bigEndian);
					} else {
						offset = numValues > 2 ? valueOffset : (entryOffset + 8);
						vals = [];
						for (n=0;n<numValues;n++) {
							vals[n] = file.getShortAt(offset + 2*n, bigEndian);
						}
						data = vals;
					}
					break;


				// 4 = long, 32 bit int;
				case 4:
					if (numValues === 1) {
						data = file.getLongAt(entryOffset + 8, bigEndian);
					} else {
						vals = [];
						for (n=0;n<numValues;n++) {
							vals[n] = file.getLongAt(valueOffset + 4*n, bigEndian);
						}
						data = vals;
					}
					break;


				// 5 = rational = two long values, first is numerator, second is denominator;
				case 5:
					if (numValues === 1) {
						numerator = file.getLongAt(valueOffset, bigEndian);
						denominator = file.getLongAt(valueOffset+4, bigEndian);
						val = new Number(numerator / denominator);
						val.numerator = numerator;
						val.denominator = denominator;
						data = val;
					} else {
						vals = [];
						for (n=0;n<numValues;n++) {
							numerator = file.getLongAt(valueOffset + 8*n, bigEndian);
							denominator = file.getLongAt(valueOffset+4 + 8*n, bigEndian);
							vals[n] = new Number(numerator / denominator);
							vals[n].numerator = numerator;
							vals[n].denominator = denominator;
						}
						data = vals;
					}
					break;


				// 9 = slong, 32 bit signed int;
				case 9:
					if (numValues === 1) {
						data = file.getSLongAt(entryOffset + 8, bigEndian);
					} else {
						vals = [];
						for (n=0;n<numValues;n++) {
							vals[n] = file.getSLongAt(valueOffset + 4*n, bigEndian);
						}
						data = vals;
					}
					break;


				// 10 = signed rational, two slongs, first is numerator, second is denominator;
				case 10:
					if (numValues === 1) {
						data = file.getSLongAt(valueOffset, bigEndian) / file.getSLongAt(valueOffset+4, bigEndian);
					} else {
						vals = [];
						for (n=0;n<numValues;n++) {
							vals[n] = file.getSLongAt(valueOffset + 8*n, bigEndian) / file.getSLongAt(valueOffset+4 + 8*n, bigEndian);
						}
						data = vals;
					}
					break;
			}

			return data;
		},

		StringTags: {
			0x9000: 'ExifVersion',
			0xA000: 'FlashpixVersion',
			0xA001: 'ColorSpace',
			0xA002: 'PixelXDimension',
			0xA003: 'PixelYDimension',
			0x9101: 'ComponentsConfiguration',
			0x9102: 'CompressedBitsPerPixel',
			0x927C: 'MakerNote',
			0x9286: 'UserComment',
			0xA004: 'RelatedSoundFile',
			0x9003: 'DateTimeOriginal',
			0x9004: 'DateTimeDigitized',
			0x9290: 'SubsecTime',
			0x9291: 'SubsecTimeOriginal',
			0x9292: 'SubsecTimeDigitized',
			0x829A: 'ExposureTime',
			0x829D: 'FNumber',
			0x8822: 'ExposureProgram',
			0x8824: 'SpectralSensitivity',
			0x8827: 'ISOSpeedRatings',
			0x8828: 'OECF',
			0x9201: 'ShutterSpeedValue',
			0x9202: 'ApertureValue',
			0x9203: 'BrightnessValue',
			0x9204: 'ExposureBias',
			0x9205: 'MaxApertureValue',
			0x9206: 'SubjectDistance',
			0x9207: 'MeteringMode',
			0x9208: 'LightSource',
			0x9209: 'Flash',
			0x9214: 'SubjectArea',
			0x920A: 'FocalLength',
			0xA20B: 'FlashEnergy',
			0xA20C: 'SpatialFrequencyResponse',
			0xA20E: 'FocalPlaneXResolution',
			0xA20F: 'FocalPlaneYResolution',
			0xA210: 'FocalPlaneResolutionUnit',
			0xA214: 'SubjectLocation',
			0xA215: 'ExposureIndex',
			0xA217: 'SensingMethod',
			0xA300: 'FileSource',
			0xA301: 'SceneType',
			0xA302: 'CFAPattern',
			0xA401: 'CustomRendered',
			0xA402: 'ExposureMode',
			0xA403: 'WhiteBalance',
			0xA404: 'DigitalZoomRation',
			0xA405: 'FocalLengthIn35mmFilm',
			0xA406: 'SceneCaptureType',
			0xA407: 'GainControl',
			0xA408: 'Contrast',
			0xA409: 'Saturation',
			0xA40A: 'Sharpness',
			0xA40B: 'DeviceSettingDescription',
			0xA40C: 'SubjectDistanceRange',
			0xA420: 'ImageUniqueID',
			0x0100: 'ImageWidth',
			0x0101: 'ImageHeight',
			0x8769: 'ExifIFDPointer',
			0x8825: 'GPSInfoIFDPointer',
			0xA005: 'InteroperabilityIFDPointer',
			0x0102: 'BitsPerSample',
			0x0103: 'Compression',
			0x0106: 'PhotometricInterpretation',
			0x0112: 'Orientation',
			0x0115: 'SamplesPerPixel',
			0x011C: 'PlanarConfiguration',
			0x0212: 'YCbCrSubSampling',
			0x0213: 'YCbCrPositioning',
			0x011A: 'XResolution',
			0x011B: 'YResolution',
			0x0128: 'ResolutionUnit',
			0x0111: 'StripOffsets',
			0x0116: 'RowsPerStrip',
			0x0117: 'StripByteCounts',
			0x0201: 'JPEGInterchangeFormat',
			0x0202: 'JPEGInterchangeFormatLength',
			0x012D: 'TransferFunction',
			0x013E: 'WhitePoint',
			0x013F: 'PrimaryChromaticities',
			0x0211: 'YCbCrCoefficients',
			0x0214: 'ReferenceBlackWhite',
			0x0132: 'DateTime',
			0x010E: 'ImageDescription',
			0x010F: 'Make',
			0x0110: 'Model',
			0x0131: 'Software',
			0x013B: 'Artist',
			0x8298: 'Copyrigh'
		},

		StringValues: {
			ExposureProgram : {
				0: 'Not defined',
				1: 'Manual',
				2: 'Normal program',
				3: 'Aperture priority',
				4: 'Shutter priority',
				5: 'Creative program',
				6: 'Action program',
				7: 'Portrait mode',
				8: 'Landscape mode'
			},
			MeteringMode : {
				0: 'Unknown',
				1: 'Average',
				2: 'CenterWeightedAverage',
				3: 'Spot',
				4: 'MultiSpot',
				5: 'Pattern',
				6: 'Partial',
				255: 'Other'
			},
			LightSource : {
				0: 'Unknown',
				1: 'Daylight',
				2: 'Fluorescent',
				3: 'Tungsten (incandescent light)',
				4: 'Flash',
				9: 'Fine weather',
				10: 'Cloudy weather',
				11: 'Shade',
				12: 'Daylight fluorescent (D 5700 - 7100K)',
				13: 'Day white fluorescent (N 4600 - 5400K)',
				14: 'Cool white fluorescent (W 3900 - 4500K)',
				15: 'White fluorescent (WW 3200 - 3700K)',
				17: 'Standard light A',
				18: 'Standard light B',
				19: 'Standard light C',
				20: 'D55',
				21: 'D65',
				22: 'D75',
				23: 'D50',
				24: 'ISO studio tungsten',
				255: 'Other'
			},
			Flash : {
				0x0000: 'Flash did not fire',
				0x0001: 'Flash fired',
				0x0005: 'Strobe return light not detected',
				0x0007: 'Strobe return light detected',
				0x0009: 'Flash fired, compulsory flash mode',
				0x000D: 'Flash fired, compulsory flash mode, return light not detected',
				0x000F: 'Flash fired, compulsory flash mode, return light detected',
				0x0010: 'Flash did not fire, compulsory flash mode',
				0x0018: 'Flash did not fire, auto mode',
				0x0019: 'Flash fired, auto mode',
				0x001D: 'Flash fired, auto mode, return light not detected',
				0x001F: 'Flash fired, auto mode, return light detected',
				0x0020: 'No flash function',
				0x0041: 'Flash fired, red-eye reduction mode',
				0x0045: 'Flash fired, red-eye reduction mode, return light not detected',
				0x0047: 'Flash fired, red-eye reduction mode, return light detected',
				0x0049: 'Flash fired, compulsory flash mode, red-eye reduction mode',
				0x004D: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected',
				0x004F: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected',
				0x0059: 'Flash fired, auto mode, red-eye reduction mode',
				0x005D: 'Flash fired, auto mode, return light not detected, red-eye reduction mode',
				0x005F: 'Flash fired, auto mode, return light detected, red-eye reduction mode'
			},
			SensingMethod : {
				1: 'Not defined',
				2: 'One-chip color area sensor',
				3: 'Two-chip color area sensor',
				4: 'Three-chip color area sensor',
				5: 'Color sequential area sensor',
				7: 'Trilinear sensor',
				8: 'Color sequential linear sensor'
			},
			SceneCaptureType : {
				0: 'Standard',
				1: 'Landscape',
				2: 'Portrait',
				3: 'Night scene'
			},
			SceneType : {
				1: 'Directly photographed'
			},
			CustomRendered : {
				0: 'Normal process',
				1: 'Custom process'
			},
			WhiteBalance : {
				0: 'Auto white balance',
				1: 'Manual white balance'
			},
			GainControl : {
				0: 'None',
				1: 'Low gain up',
				2: 'High gain up',
				3: 'Low gain down',
				4: 'High gain down'
			},
			Contrast : {
				0: 'Normal',
				1: 'Soft',
				2: 'Hard'
			},
			Saturation : {
				0: 'Normal',
				1: 'Low saturation',
				2: 'High saturation'
			},
			Sharpness : {
				0: 'Normal',
				1: 'Soft',
				2: 'Hard'
			},
			SubjectDistanceRange : {
				0: 'Unknown',
				1: 'Macro',
				2: 'Close view',
				3: 'Distant view'
			},
			FileSource : {
				3: 'DSC'
			},
			Components : {
				0: '',
				1: 'Y',
				2: 'Cb',
				3: 'Cr',
				4: 'R',
				5: 'G',
				6: 'B'
			}
		},

		GPSTags: {
			0x0000: 'GPSVersionID',
			0x0001: 'GPSLatitudeRef',
			0x0002: 'GPSLatitude',
			0x0003: 'GPSLongitudeRef',
			0x0004: 'GPSLongitude',
			0x0005: 'GPSAltitudeRef',
			0x0006: 'GPSAltitude',
			0x0007: 'GPSTimeStamp',
			0x0008: 'GPSSatellites',
			0x0009: 'GPSStatus',
			0x000A: 'GPSMeasureMode',
			0x000B: 'GPSDOP',
			0x000C: 'GPSSpeedRef',
			0x000D: 'GPSSpeed',
			0x000E: 'GPSTrackRef',
			0x000F: 'GPSTrack',
			0x0010: 'GPSImgDirectionRef',
			0x0011: 'GPSImgDirection',
			0x0012: 'GPSMapDatum',
			0x0013: 'GPSDestLatitudeRef',
			0x0014: 'GPSDestLatitude',
			0x0015: 'GPSDestLongitudeRef',
			0x0016: 'GPSDestLongitude',
			0x0017: 'GPSDestBearingRef',
			0x0018: 'GPSDestBearing',
			0x0019: 'GPSDestDistanceRef',
			0x001A: 'GPSDestDistance',
			0x001B: 'GPSProcessingMethod',
			0x001C: 'GPSAreaInformation',
			0x001D: 'GPSDateStamp',
			0x001E: 'GPSDifferential'
		}
	};

	BinaryImage = function(imageBin) {
		var dataOffset = 0;
		this.length = imageBin.length;

		this.getByteAt = function(imageOffset) {
			return imageBin.charCodeAt(imageOffset + dataOffset) & 0xFF;
		};

		this.getBytesAt = function(imageOffset, imageLength) {
			var bytesArray = [];

			for (var i = 0; i < imageLength; i++) {
				bytesArray[i] = imageBin.charCodeAt((imageOffset + i) + dataOffset) & 0xFF;
			}

			return bytesArray;
		};

		this.getShortAt = function(imageOffset, binaryBigEndian) {
			var imageShort;

			if(binaryBigEndian){
				imageShort = (this.getByteAt(imageOffset) << 8) + this.getByteAt(imageOffset + 1);
			} else {
				imageShort = (this.getByteAt(imageOffset + 1) << 8) + this.getByteAt(imageOffset);
			}

			if (imageShort < 0){
				imageShort += 65536;
			}

			return imageShort;
		};

		this.getLongAt = function(imageOffset, binaryBigEndian) {
			var imageShort,
				imageByte1 = this.getByteAt(imageOffset),
				imageByte2 = this.getByteAt(imageOffset + 1),
				imageByte3 = this.getByteAt(imageOffset + 2),
				imageByte4 = this.getByteAt(imageOffset + 3);

			if(binaryBigEndian){
				imageShort = (((((imageByte1 << 8) + imageByte2) << 8) + imageByte3) << 8) + imageByte4;
			} else {
				imageShort = (((((imageByte4 << 8) + imageByte3) << 8) + imageByte2) << 8) + imageByte1;
			}

			if (imageShort < 0){
				imageShort += 4294967296;
			}

			return imageShort;
		};

		this.getSLongAt = function(imageOffset, binaryBigEndian) {
			var imageUnsignedLong = this.getLongAt(imageOffset, binaryBigEndian);

			if (imageUnsignedLong > 2147483647){
				imageUnsignedLong = (imageUnsignedLong - 4294967296);
			}

			return imageUnsignedLong;
		};

		this.getStringAt = function(imageOffset, imageLength) {
			var bytesArray,
				stringArray = [];

			bytesArray = this.getBytesAt(imageOffset, imageLength);

			for (var j=0; j < imageLength; j++) {
				stringArray[j] = String.fromCharCode(bytesArray[j]);
			}

			return stringArray.join('');
		};
	};


	return {
		readData: FileHandle.readData,
		readBase64: FileHandle.readBase64
	};

})();


