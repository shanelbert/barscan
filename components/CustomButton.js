import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	ActivityIndicator,
	Pressable
} from 'react-native';
import { colors } from '../utils/constants';

const styles = StyleSheet.create({
	customButton: {
		width: '100%',
		// height mengikuti customButtontext

		elevation: 4,
		backgroundColor: colors.primary,
		borderRadius: 2,
	},
	customButtontext: {
		textAlign: 'center',
		color: 'white',
		fontWeight: '500',
		margin: 12,
	},
	customButtonDisabled: {
		elevation: 1,
		backgroundColor: colors.disabled,
	},
	customButtonSelected: {
		backgroundColor: colors.primaryDark,
	},
	customButtonTextDisabled: {
		color: colors.textDisabled,
	},
	activityIndicatorContainer: {
		position: 'absolute',
		zIndex: 1,

		width: '100%',
		height: '100%',

		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	}
})

function isObject(x) {
	return (
		(typeof x === 'object') &&
		(!Array.isArray(x)) &&
		(x !== null)
	);
}

function CustomButton(providedProps) {
	let props = {};

	const expectedProps = [
		'onPress',
		'selected',
		'disabled',
		'style',
		'isLoading',
		'title',
		'baseColor',
		'selectedColor',
		'disabledColor'
	];
	const defaults = {
		selected: false,
		disabled: false,
		isLoading: false
	};

	for (let e of expectedProps) {
		props[e] = providedProps[e] ?? defaults[e];
	}

	return (
		<View style={[
			styles.customButton,
			props.baseColor ? { backgroundColor: props.baseColor } : {},
			props.selected ? styles.customButtonSelected : {},
			props.selectedColor ? { backgroundColor: props.selectedColor } : {},
			props.disabled ? styles.customButtonDisabled : {},
			isObject(props.style) ? props.style : {}
		]}>
			<Pressable
				onPress={props.disabled ? null : props.onPress}
				android_ripple={props.disabled ? null : { color: 'white', borderless: false }}
				style={{ width: '100%' }}
			>
				{props.isLoading ? (<View style={styles.activityIndicatorContainer}><ActivityIndicator /></View>) : null}
				<Text style={[
					styles.customButtontext,
					props.disabled ? styles.customButtonTextDisabled : {}
				]}>
					{props.isLoading ? '\u200B' : props.title}
				</Text>
			</Pressable>
		</View>
	);
}

export default CustomButton;