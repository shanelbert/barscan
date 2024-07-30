import React from 'react';
import { 
	StyleSheet, 
	Text
} from 'react-native';

const styles = StyleSheet.create({
	textBase: {
		color: 'black'
	}
})

function isObject(x) {
	return (
		(typeof x === 'object') &&
		(!Array.isArray(x)) &&
		(x !== null)
	);
}

function CustomText(props) {
	return (
		<Text style={[styles.textBase, isObject(props.style) ? props.style : {}]}>
			{props.children}
		</Text>
	);
}

export default CustomText;