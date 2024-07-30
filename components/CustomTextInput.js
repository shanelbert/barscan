import React from 'react';
import {
	View,
	TextInput,
	StyleSheet
} from 'react-native';
import { colors } from '../utils/constants';

const styles = StyleSheet.create({
	textInputContainer: {
		borderTopRightRadius: 4,
		borderTopLeftRadius: 4,
		width: '100%',
		overflow: 'hidden'
	},
	textInput: {
		height: 40,
		borderBottomWidth: 0.5,
		backgroundColor: 'whitesmoke',
		borderBottomColor: 'gray',
		color: 'black'
	},
	textInputFocused: {
		backgroundColor: '#E1E1E1',
		borderBottomColor: colors.primary,
		borderBottomWidth: 2,
	},
})

function isObject(x) {
	return (
		(typeof x === 'object') &&
		(!Array.isArray(x)) &&
		(x !== null)
	);
}

function CustomTextInput(props) {
	const [isFocused, setIsFocused] = React.useState(false);

	return (
		<View style={styles.textInputContainer}>
			<TextInput
				placeholder={props.placeholder}
				placeholderTextColor='gray'
				value={props.value}
				onChangeText={props.onChangeText}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				style={[
					styles.textInput,
					isFocused ? styles.textInputFocused : {},
					isObject(props.style) ? props.style : {}
				]}
			/>
		</View>
	);
}

export default CustomTextInput;