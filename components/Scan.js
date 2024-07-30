import React from 'react';
import {
	StyleSheet,
	View,
	Modal,
	FlatList,
	ActivityIndicator,
	Pressable,
	Image,
	useWindowDimensions
} from 'react-native';
import Snackbar from 'react-native-snackbar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import CustomButton from './CustomButton';
import CustomText from './CustomText';
import { colors } from '../utils/constants';

const styles = StyleSheet.create({
	mainContainer: {
		backgroundColor: 'white',
		width: '100%',
		height: '100%',

		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center'
	},
	camera: {
		position: 'absolute',
		left: 0,
		top: 0,

		zIndex: 0,
	},
	cameraUnmountCover: {
		position: 'absolute',
	
		width: '100%',
		height: '100%',
	
		backgroundColor: 'black',
		
		zIndex: 1, // di atas camera
	},
	cameraOverlay: {
		position: 'absolute',

		width: '100%',
		height: '100%',

		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		alignItems: 'center',

		zIndex: 2, // di atas cameraUnmountCover
	},
	scannerReticle: {
		width: 180,
		height: 100,

		borderColor: 'white',
		borderWidth: 2,
		borderRadius: 8,
		borderStyle: 'dashed'
	},
	topContainer: {
		width: '100%',
		flex: 1, // mengisi sisa tinggi dari bottomContainer

		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	bottomContainer: {
		width: '100%',
		// height: mengikuti isi

		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		alignItems: 'center',

		paddingTop: 16,
		paddingBottom: 16,
		paddingLeft: 32,
		paddingRight: 32,

		backgroundColor: 'white'
	},
	label: {
		fontSize: 12,
		fontWeight: '400',

		marginBottom: 4,
		marginLeft: 4,
	},
	input: {
		width: '100%',
		// height: mengikuti isi

		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',

		marginBottom: 16,
	},
	buttonContainer: {
		// height: mengikuti isi
		width: '100%',

		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
	},
	modalContainer: {
		width: '100%',
		height: '100%',

		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',

		padding: 40,

		backgroundColor: 'rgba(0, 0, 0, 0.8)',
	},
	modalPaper: {
		// height: mengikuti isi
		width: '100%',

		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',

		backgroundColor: 'white',

		borderRadius: 20,

		padding: 16,
	},
	settingContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,

		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',

		overflow: 'hidden'
	},
	listOptionContainer: {
		width: '100%',

		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',

		padding: 16,
	},
	listOptionText: {
		fontSize: 16,
	},
});

const spreadsheetPlaceholder = 'SELECT';
const serialNoPlaceholder = 'SCAN';
const sheetPlaceholder = 'SELECT';

function Scan({ navigation }) {
	const windowDimensions = useWindowDimensions();
	const deviceHeight = windowDimensions.height;
	const deviceWidth = windowDimensions.width;

	const abortController = React.useRef(null);

	const [showCamera, setShowCamera] = React.useState(null);
	const [showCameraCover, setShowCameraCover] = React.useState(null);

	const [spreadsheetId, setSpreadsheetId] = React.useState(null);
	const [spreadsheetName, setSpreadsheetName] = React.useState(null);
	const [sheetName, setSheetName] = React.useState(null);
	const [serialNo, setSerialNo] = React.useState(null);

	const [sheetOptions, setSheetOptions] = React.useState([]);
	const [spreadsheetOptions, setSpreadsheetOptions] = React.useState([]);

	const [scanMode, setScanMode] = React.useState(null);
	const [resource, setResource] = React.useState(null);

	const [readyToSubmit, setReadyToSubmit] = React.useState(false);
	const [modalVisible, setModalVisible] = React.useState(false);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [modalActIndVisible, setModalActIndVisible] = React.useState(false);

	const [permission, requestPermission] = useCameraPermissions();
	
	const [reticleTop, setReticleTop] = React.useState(0);
	const [reticleLeft, setReticleLeft] = React.useState(0);
	const [reticleWidth, setReticleWidth] = React.useState(0);
	const [reticleHeight, setReticleHeight] = React.useState(0);

	React.useEffect(() => {
		async function f() {
			if (permission === null) {
				requestPermission();
			}

			const spreadsheets = await AsyncStorage.getItem('spreadsheets');
			if (spreadsheets === null) {
				await AsyncStorage.setItem('spreadsheets', '[]');
			}

			const serverAddress = await AsyncStorage.getItem('server');
			if (serverAddress === null) {
				await AsyncStorage.setItem('server', `192.168.0.195:8080`);
			}
		}

		f();
	}, []);

	React.useEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<View style={styles.settingContainer}>
					<Pressable
						onPress={() => setShowCameraCover(true)}
						android_ripple={{ colors: colors.grayRipple, borderless: true }}
					>
						<View style={styles.settingContainer}>
							<Image
								source={require('../assets/setting.png')}
								style={{ width: 20, height: 20 }}
							/>
						</View>
					</Pressable>
				</View>
			),
		});
	}, [navigation]);

	React.useEffect(() => {
		setReadyToSubmit(spreadsheetId && sheetName && serialNo);
	}, [spreadsheetId, serialNo, sheetName]);

	useFocusEffect(
		React.useCallback(() => {
			async function f() {
				setShowCamera(true);
				setShowCameraCover(false);
				
				setSpreadsheetId(null);
				setSpreadsheetName(null);
				setSheetName(null);
			}
			f();
			
			return () => setShowCamera(null);
		}, [])
	);

	function scanSerialNo() {
		if (scanMode === 'serialNo') {
			setScanMode(null);
			return
		}
		setScanMode('serialNo');
	}

	function isInReticle(l, t) {
		return (
			(reticleLeft <= l) & (l <= reticleLeft + reticleWidth)
			& (reticleTop <= t) & (t <= reticleTop + reticleHeight)
		);
	}

	function barCodeScanned(scanResult) {
		// console.log(`type: ${scanResult.type}, data: ${scanResult.data}`); // to check barcode type
		
		const { boundingBox, data } = scanResult;

		// distance of 'top left corner of scan result bounding box' from 'device top'
		let scanResultTop = Number(boundingBox.origin.x);

		// distance of 'top left corner of scan result bounding box' from 'device left'
		let scanResultLeft = Number(boundingBox.origin.y);

		let scanResultWidth = Number(boundingBox.size.height);
		let scanResultHeight = Number(boundingBox.size.width);

		// keempat titik scan result bounding box ada di dalam scanner reticle

		let isScanPositionValid = (
			// top left
			isInReticle(scanResultLeft, scanResultTop)
			// bottom left
			& isInReticle(scanResultLeft, scanResultTop + scanResultHeight)
			// top right
			& isInReticle(scanResultLeft + scanResultWidth, scanResultTop)
			// bottom right
			& isInReticle(scanResultLeft + scanResultWidth, scanResultTop + scanResultHeight)
		);

		if (!isScanPositionValid) {
			return;
		}

		setScanMode(null);
		if (scanMode === 'orderNo') {
			setOrderNo(data);
		} else {
			setSerialNo(data);
		}
		showToast({ message: `Scan success`, backgroundColor: colors.success });
	}

	function getReticleAbsPosition(event) {
		// y = jarak dari atas (css top)
		// x = jarak dari kiri (css left)
		setReticleLeft(event.nativeEvent.layout.x);
		setReticleTop(event.nativeEvent.layout.y);
		setReticleWidth(event.nativeEvent.layout.width);
		setReticleHeight(event.nativeEvent.layout.height);
	}

	function showToast(input) {
		const { message, backgroundColor } = input;
		Snackbar.show({
			text: message,
			textColor: 'white',
			backgroundColor: backgroundColor ?? colors.primary,
			duration: Snackbar.LENGTH_SHORT,
			marginBottom: deviceHeight - deviceHeight * 0.2
		});
	}

	function openModal(resource) {
		setResource(resource);
		setModalVisible(true);
		setModalActIndVisible(true);
	}

	async function loadOptions() {
		try {
			abortController.current = new AbortController();

			if (resource === 'sheet') {
				setTimeout(() => {
					if (abortController.current !== null) {
						abortController.current.abort();
						abortController.current = null;
					}
				}, 10000);

				const serverAddress = await AsyncStorage.getItem('server');

				const response = await fetch(
					`http://${serverAddress}/allsheetname`,
					{
						method: 'POST',
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ spreadsheetId }),
						signal: abortController.current.signal
					});

				const responseData = await response.json();

				if (response.status !== 200) {
					throw new Error(responseData);
				}

				setModalActIndVisible(false);
				setSheetOptions(responseData.map((sheetname) => ({ id: sheetname, name: sheetname })));
			} else if (resource === 'spreadsheet') {
				const spreadsheets = await AsyncStorage.getItem('spreadsheets');
				setModalActIndVisible(false);
				setSpreadsheetOptions(JSON.parse(spreadsheets));
			};
		} catch (err) {
			if (modalVisible) {
				setModalVisible(false);
				setModalActIndVisible(false);
				setResource(null);
				showToast({ message: `Can't load options. Reason:\n"${err.message}"`, backgroundColor: colors.fail });
			}
		} finally {
			if (abortController.current !== null) {
				abortController.current = null;
			}
		}
	}

	function closeModal() {
		setResource(null);
		setModalActIndVisible(false);
		setModalVisible(false);

		if (abortController.current !== null) {
			abortController.current.abort();
			abortController.current = null;
		}
	}

	async function submitInfo() {
		if (!readyToSubmit) {
			return;
		}

		const spreadsheets = await AsyncStorage.getItem('spreadsheets');
		if (JSON.parse(spreadsheets).every((s) => s.id !== spreadsheetId)) {
			showToast({ message: `Can't add info. The spreadsheet has been removed."`, backgroundColor: colors.fail });
			return;
		}

		setScanMode(null);
		setIsSubmitting(true);

		try {
			abortController.current = new AbortController();

			setTimeout(() => {
				if (abortController.current !== null) {
					abortController.current.abort();
					abortController.current = null;
				}
			}, 10000);

			const serverAddress = await AsyncStorage.getItem('server');
			const response = await fetch(
				`http://${serverAddress}/row`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						spreadsheetId: spreadsheetId,
						sheetTitle: sheetName,
						row: [serialNo]
					}),
					signal: abortController.current.signal
				}
			);

			const responseData = await response.json();
			if (response.status !== 200) {
				throw new Error(responseData);
			}

			setSerialNo(null);
			showToast({ message: `Info successfully added to sheet '${sheetName}'`, backgroundColor: colors.success });
		} catch (err) {
			showToast({ message: `Can't add info to spreadsheet. Reason:\n"${err.message}"`, backgroundColor: colors.fail });
		} finally {
			setIsSubmitting(false);
			if (abortController.current !== null) {
				abortController.current = null;
			}
		}
	}

	function ModalContent() {
		if (modalActIndVisible) {
			return <ActivityIndicator />;
		}

		let data = [];
		let onPress = null;
		if (resource === 'sheet') {
			data = sheetOptions;
			onPress = (item) => {
				setSheetName(item.name);
				closeModal();
			};
		} else if (resource === 'spreadsheet') {
			data = spreadsheetOptions;
			onPress = (item) => {
				if (item.id !== spreadsheetId) {
					setSpreadsheetId(item.id);
					setSpreadsheetName(item.name);
					setSheetName(null);
				}

				closeModal();
			};
		}


		if (data.length === 0) {
			return (
				<CustomText style={{ color: 'white' }}>Can't find any {resource} item</CustomText>
			);
		}

		return (
			<View style={styles.modalPaper}>
				<FlatList
					data={data}
					style={{ width: '100%' }}
					ItemSeparatorComponent={
						<View
							style={{
								backgroundColor: 'black',
								height: StyleSheet.hairlineWidth,
							}}
						/>
					}
					renderItem={({ item }) => {
						return (
							<Pressable
								onPress={() => onPress(item)}
								android_ripple={{ color: colors.grayRipple, borderless: false }}
							>
								<View style={styles.listOptionContainer}>
									<CustomText style={styles.listOptionText}>{item.name}</CustomText>
								</View>
							</Pressable>
						);
					}}
					keyExtractor={item => item.id}
				/>
			</View>
		);
	}

	return (
		<View style={styles.mainContainer}>
			<Modal
				animationType="fade"
				transparent={true}
				visible={modalVisible}
				onShow={loadOptions}
				onRequestClose={closeModal} // called when the user taps the hardware back button on Android
			>
				<Pressable onPress={closeModal}>
					<View style={styles.modalContainer}>
						<ModalContent />
					</View>
				</Pressable>
			</Modal>

			{
				showCameraCover === true ? (
						<View 
							style={styles.cameraUnmountCover} 
							onLayout={() => navigation.navigate('Setting')}/>
					) 
					: null
			}
			
			{
				permission && permission.granted && showCamera
					? (
						<CameraView 
							ratio="16:9"
							onBarcodeScanned={scanMode === null ? undefined : barCodeScanned}
							// barcodeScannerSettings={{
							// 	barcodeTypes: ['ean13', 'code128'],
							// }}
							style={[styles.camera, { width: '100%', height: Math.round((deviceWidth * 16) / 9) }]}
						/>
					)
					: null
			}

			<View style={styles.cameraOverlay}>
				<View style={styles.topContainer}>
					{
						permission === null
							? <ActivityIndicator />
							: permission.granted
								? <View style={styles.scannerReticle} onLayout={getReticleAbsPosition} />
								: <CustomText>No access to camera</CustomText>
					}
				</View>
				<View style={styles.bottomContainer}>

					<View style={styles.input}>
						<CustomText style={styles.label}>
							Spreadsheet File
						</CustomText>
						<View style={styles.buttonContainer}>
							<CustomButton
								onPress={() => openModal('spreadsheet')}
								title={spreadsheetName ?? spreadsheetPlaceholder}
								selected={resource === 'spreadsheet'}
							/>
						</View>
					</View>

					<View style={styles.input}>
						<CustomText style={styles.label}>
							Sheet
						</CustomText>
						<View style={styles.buttonContainer}>
							<CustomButton
								onPress={() => openModal('sheet')}
								title={sheetName ?? sheetPlaceholder}
								selected={resource === 'sheet'}
								disabled={!spreadsheetId}
							/>
						</View>
					</View>

					<View style={styles.input}>
						<CustomText style={styles.label}>
							Serial No.
						</CustomText>
						<View style={styles.buttonContainer}>
							<CustomButton
								onPress={scanSerialNo}
								title={serialNo ?? serialNoPlaceholder}
								selected={scanMode === 'serialNo'}
							/>
						</View>
					</View>

					<View style={[styles.input, { marginTop: 12, marginBottom: 8 }]}>
						<CustomButton
							onPress={submitInfo}
							disabled={!readyToSubmit || isSubmitting}
							title='SUBMIT'
							isLoading={isSubmitting}
						/>
					</View>

				</View>
			</View>
		</View>
	);
}

export default Scan;