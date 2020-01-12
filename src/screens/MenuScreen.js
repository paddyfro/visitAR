import React from "react";
import { StyleSheet, Text, View } from "react-native";
import NavigationButton from '../Components/NavigationButton';
import * as firebase from 'firebase';

export default class MenuScreen extends React.Component{

	componentWillMount(){
	  this.checkIfLoggedIn()
	}

	checkIfLoggedIn = async () => {
	 await firebase.auth().onAuthStateChanged(user => {
			if(user){
				console.log('Called. Logged In');
				this.setState({loggedIn: true})
			}
		});
	}

	constructor(props){
		super(props)

		this.state = ({
      loggedIn: false
    })
	}

	render() {
		return(
			<View data-test = "MenuScreen_view">
				<Text data-test = "MenuScreen_text">VisitAR</Text>
				<Text data-test = "MenuScreen_text">Menu Screen!</Text>
				{ this.state.loggedIn ?
					<NavigationButton
						data-test = "MenuScreen_button"
						title="Profile"
						icon = "address-card"
						navName = "Profile"/>
						:
						<NavigationButton
						data-test = "MenuScreen_button"
						title="Login"
						icon = "sign-in"
						navName = "Login"/>
				}

				<NavigationButton
				data-test = "MenuScreen_button"
				title="Language"
				icon = "language"
				navName = "Language"/>

				<NavigationButton
				data-test = "MenuScreen_button"
				title="Settings"
				icon = "cog"
				navName = "Settings"/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
    iconStyle:{
        marginHorizontal:10
    }
});