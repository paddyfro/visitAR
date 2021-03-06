import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    YellowBox
} from "react-native";
import NavigationButton from "../Components/NavigationButton";
import {
    Container,
    Content,
    Header,
    Form,
    Input,
    Item,
    Button,
    Label
} from "native-base";
import * as firebase from "firebase";
import Spinner from "react-native-loading-spinner-overlay";
import JWT from "expo-jwt";
import Axios from "axios";
import {getUserID, getUser} from '../../Utils/user_func';
import {styles} from "../styles/ProfileScreenStyle";
import {AsyncStorage} from 'react-native';


console.ignoredYellowBox = [
  "Setting a timer for a long period of time"];

export default class ProfileScreen extends React.Component {


  constructor(props) {
    super(props);

    this.state = ({
      name: '',
      email: '',
      emailVerified: false,
      photoURL: '',
      uid: '',
      history: ''
    })
  }

  async componentWillMount() {

    this.showLoader();

    const user = getUser();

    if(user){

      let {uid, email, displayName, photoURL} = user;
      const ref = firebase.storage().ref(user.photoURL);

      ref.getDownloadURL().then( (url) => {
        this.setState({ uid });
        this.setState({ email });
        this.setState({ displayName });
        this.setState({ image: url });
      })
    }

    const access_token = await AsyncStorage.getItem('JWT');
    Axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
//
// axios({
    //   method: "get",
    //   url: `https://orion-visitar.herokuapp.com/favourite?uid=${user.uid}`
    // }).then( (results) => {
    //
    //   const result = results.data.map(obj => obj.tour_id );
    //   this.setState({ favourite: result });
    // })

    // axios({
    //   method: "get",
    //   url: `https://orion-visitar.herokuapp.com/history?uid=${user.uid}`
    // }).then( (results) => {
    //     //console.log(results.data)
    //     // const result = results.data.map(obj => (
    //     //   {
    //     //     name: obj.tour_taken,
    //     //     completed: obj.completed,
    //     //     time_started: obj.time_started
    //     //
    //     //   }
    //     // ) );
    //
    //     //console.log(result)
    //     this.setState({ history: results.data });
    // })

    this.hideLoader();
  }

  showLoader = () => {
    this.setState({ showLoader: true });
  };

  hideLoader = () => {
    this.setState({ showLoader: false });
  };

  logOut = () => {
    firebase
      .auth()
      .signOut()
      .then(
        () => {
          console.log("Signed Out");
          this.props.navigation.navigate("GMaps");
        },
        function(error) {
          console.error("Sign Out Error", error);
        }
      );
  };


  render() {
    let { image, history } = this.state;

    return (
      <Container style={styles.container}>
        <Content>
          <Image source={{ uri: image }} style={styles.profile_pic} />
        {/*  <Text>Name: {this.state.name && null}</Text>*/}
          <Text>Email: {this.state.email}</Text>
         {/* <Text>User ID: {this.state.uid}</Text>*/}
          {/*<Text>Photo URL: {this.state.photoURL}</Text>*/}

          <Button
            style={styles.Button}
            full
            rounded
            success
            onPress={() => this.logOut()}
          >
            <Text style={{ color: "#fff" }}>Log out</Text>
          </Button>

          <NavigationButton
            style={styles.Button}
            data-test="ProfileScreen_button"
            title="Home"
            icon="home"
            navName="GMaps"
          />

{/*          <NavigationButton
            style={styles.Button}
            data-test="ProfileScreen_button"
            title="Update Profile"
            icon="edit"
            navName="EditProfile"
          />
          */}
        </Content>
        {this.state.showLoader && (
          <Spinner
            visible={true}
            textContent={"Loading..."}
            textStyle={styles.spinnerTextStyle}
          />
        )}
      </Container>
    );
  }
}
