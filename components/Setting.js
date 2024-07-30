import React from 'react';
import {
	View,
	KeyboardAvoidingView,
	StyleSheet,
	Pressable,
	Keyboard,
	useWindowDimensions
} from 'react-native';
import Snackbar from 'react-native-snackbar';
import { colors } from '../utils/constants';
import CustomButton from './CustomButton';
import CustomText from './CustomText';
import CustomTextInput from './CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
	mainContainer: {
		backgroundColor: 'white',
		width: '100%',
		height: '100%',

		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',

		paddingLeft: 16,
		paddingRight: 16,
		paddingBottom: 32,
		paddingTop: 32,
	},
	inputContainerColumn: {
		width: '100%',
		// height: mengikuti isi

		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	inputContainerRow: {
		width: '100%',
		// height: mengikuti isi

		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	buttonContainer: {
		width: '100%',
		// height: mengikuti isi

		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	label: {
		fontSize: 12,
		fontWeight: '400',

		marginBottom: 4,
		marginLeft: 4,
	},
});

function Setting() {
	const abortController = React.useRef(null);

	const windowDimensions = useWindowDimensions();
	const deviceHeight = windowDimensions.height;

	const [isSubmittingSprId, setIsSubmittingSprId] = React.useState(false);

	const [ipInput, setIpInput] = React.useState('');
	const [portInput, setPortInput] = React.useState('');
	const [spreadsheetInput, setSpreadsheetInput] = React.useState('');


	React.useEffect(() => {
		async function f() {
			let serverAddress = await AsyncStorage.getItem('server');
			if (serverAddress !== null) {
				let [ip, port] = serverAddress.split(':');
				setIpInput(ip);
				setPortInput(port);
			}
		}

		f();
	}, []);


	function showToast(input) {
		const { message, backgroundColor } = input;
		Snackbar.show({
			text: message,
			textColor: 'white',
			backgroundColor: backgroundColor ?? colors.primary,
			duration: Snackbar.LENGTH_SHORT,
			marginBottom: deviceHeight - 140
		});
	}


	function getSpreadsheetId() {
		let pattern = new RegExp('docs\.google\.com\/spreadsheets\/d\/(.*)\/.*', 'g');
		let spreadsheetId;

		if (spreadsheetInput.includes('docs.google.com')) {
			let matchRes = spreadsheetInput.matchAll(pattern);
			let filteredRes = [...matchRes].map((s) => s[1]);
			spreadsheetId = filteredRes[0];
		} else {
			spreadsheetId = spreadsheetInput;
		}
		return spreadsheetId;
	}


	async function unregister() {
		Keyboard.dismiss();

		try {
			const spreadsheetId = getSpreadsheetId();

			let spreadsheets = await AsyncStorage.getItem('spreadsheets');
			spreadsheets = JSON.parse(spreadsheets);

			await AsyncStorage.setItem(
				'spreadsheets',
				JSON.stringify(spreadsheets.filter((s) => s.id !== spreadsheetId))
			);

			showToast({ message: 'Spreadsheet unregistered successfully', backgroundColor: colors.success });
		} catch (err) {
			showToast({ message: `Can't unregister spreadsheet. Reason:\n"${err.message}"`, backgroundColor: colors.fail });
		}
	}


	async function register() {
		setIsSubmittingSprId(true);
		Keyboard.dismiss();

		try {
			const spreadsheetId = getSpreadsheetId();

			let spreadsheets = await AsyncStorage.getItem('spreadsheets');
			spreadsheets = JSON.parse(spreadsheets);

			if (spreadsheets.every((s) => s.id !== spreadsheetId)) {

				abortController.current = new AbortController();
				console.log(abortController.current);
				setTimeout(() => {
					if (abortController.current !== null) {
						abortController.current.abort();
						abortController.current = null;
					}
				}, 10000);

				const serverAddress = await AsyncStorage.getItem('server');
				if (serverAddress === null) {
					throw new Error("IP and port haven't been set yet");
				}
				
				const response = await fetch(
					`http://${serverAddress}/spreadsheetname`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ spreadsheetId }),
						signal: abortController.current.signal
					});

				const responseData = await response.json();

				if (response.status !== 200) {
					throw new Error(responseData);
				}

				await AsyncStorage.setItem(
					'spreadsheets',
					JSON.stringify([...spreadsheets, { id: spreadsheetId, name: responseData }])
				);

				showToast({ message: 'Spreadsheet registered succesfully', backgroundColor: colors.success });
			} else {
				showToast({ message: 'Spreadsheet already registered' });
			}

		} catch (err) {
			showToast({ message: `Can't register spreadsheet. Reason:\n"${err.message}"`, backgroundColor: colors.fail });
		} finally {
			setIsSubmittingSprId(false);
			if (abortController.current !== null) {
				abortController.current = null;
			}
		}
	}

	async function setServer() {
		Keyboard.dismiss();

		try {
			let ipPattern = /^\d+\.\d+\.\d+\.\d+$/g;
			if (!ipPattern.test(ipInput)) {
				throw new Error('Malformed IP');
			}

			let portPattern = /^\d+$/g;
			if (!portPattern.test(portInput)) {
				throw new Error('Port must only contains numbers');
			}

			await AsyncStorage.setItem('server', `${ipInput}:${portInput}`);
			showToast({ message: 'Server address set', backgroundColor: colors.success });
		} catch (err) {
			showToast({ message: `Can't set address. Reason:\n"${err.message}"`, backgroundColor: colors.fail });
		}
	}

	return (
		<Pressable onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView
				behavior='height'
				style={styles.mainContainer}>

				<View style={[styles.inputContainerRow, , { marginBottom: 8 }]}>
					<View style={[styles.inputContainerColumn, { flex: 4, marginRight: 8 },]}>
						<CustomText style={styles.label}>
							IP
						</CustomText>
						<CustomTextInput
							value={ipInput}
							onChangeText={(text) => setIpInput(text)}
							placeholder="IP"
						/>
					</View>
					<View style={[styles.inputContainerColumn, { flex: 3 },]}>
						<CustomText style={styles.label}>
							Port
						</CustomText>
						<CustomTextInput
							value={portInput}
							onChangeText={(text) => setPortInput(text)}
							placeholder="Port"
						/>
					</View>
				</View>

				<View style={[styles.buttonContainer, { marginBottom: 32 }]}>
					<CustomButton
						onPress={setServer}
						disabled={(ipInput === '') || (portInput === '')}
						title="SET"
					/>
				</View>

				<View style={[styles.inputContainerColumn, { marginBottom: 8 }]}>
					<CustomText style={styles.label}>
						Spreadsheet URL/ID
					</CustomText>
					<CustomTextInput
						onChangeText={(text) => setSpreadsheetInput(text)}
						placeholder="URL/ID"
					/>
				</View>

				<View style={styles.buttonContainer}>
					<View style={{ flex: 1, marginRight: 8 }}>
						<CustomButton
							onPress={unregister}
							disabled={(spreadsheetInput === '') || isSubmittingSprId}
							title='REMOVE'
							isLoading={isSubmittingSprId}
							baseColor={colors.fail}
						/>
					</View>
					<View style={{ flex: 2 }}>
						<CustomButton
							onPress={register}
							disabled={(spreadsheetInput === '') || isSubmittingSprId}
							title='REGISTER'
							isLoading={isSubmittingSprId}
							baseColor={colors.success}
						/>
					</View>
				</View>
				
			</KeyboardAvoidingView>
		</Pressable>
	);
}

export default Setting;