import React from "react";
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Button,
    Animated,
    Image,
    Easing,
    requireNativeComponent,
    Alert,
    TouchableOpacity,
    TouchableHighlight,
    StatusBar,
    Vibration,
    Modal
} from "react-native";

import {
    GOOGLE_MAPS_APIKEY
} from "../../config/config.js"
import NavigationButton from "../Components/NavigationButton";
import AnimatedLoadingBar from "../Components/AnimatedLoadingBar"
import Spinner from "react-native-loading-spinner-overlay";
import MapView, {
    Marker,
    Callout
} from "react-native-maps";
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions'
import JWT from "expo-jwt";
import Axios from "axios";
import {
    withTheme
} from "react-native-elements";
import UserInterface from "../Components/UserInterface";
import {
    HitTestResultTypes
} from "expo/build/AR";
import {
    getDistance,
    getPreciseDistance,
    geolib
} from "geolib";
import * as Speech from 'expo-speech';
import Constants from 'expo-constants';
import * as Progress from 'react-native-progress';
import InfoPopUp from "../Components/InfoPopUp";
import CustomMarker from "../Components/CustomMarker";
import PickUpTokenButton from "../Components/PickUpTokenButton";
import { Notifications } from 'expo';
import {getUserID} from '../../Utils/user_func';
import {getTime, getDate} from '../../Utils/date_time';
import Images from'../../assets/images';
import {AsyncStorage} from 'react-native';

var closestToken;
var num_of_tokens = 0;
var token1 = 0;
var token2 = 0;
var token3 = 0;
var token4 = 0;
var token5 = 0;
var token6 = 0;
var token7 = 0;
var token8 = 0;



var tokens = [token1, token2, token3, token4,token5,token6,token7,token8];

const LOCATION_SETTINGS = {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 200,
    distanceInterval: 0,
};


export default class GoogleMapsScreen extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            latitude: null,
            longitude: null,
            latitudeDelta: 0.007,
            longitudeDelta: 0.007,
            coords: [],
            showLoader: false,
            uiState: 0,
            waypoints: null,
            tour: {
                date: '',
                time_started: 0,
                time_finished: 0,
                tourStarted: false,
                tour_completed: false,
                origin: null,
                destination: null,
                nextLocation: 1,
                landmarks_visited: []
            },
            num_of_tokens:0,
            tokenUpdateVisible:false,
            tokenCollectVisible:false,
            tokenInfoVisible:false,
            distanceTokenModal:false

        }
    }

    async componentDidMount() {

        const result = await Axios({
          method: "get",
          url: 'https://orion-visitar.herokuapp.com/auth'
        });

        Axios.defaults.headers.common["Authorization"] = `Bearer ${result.data}`;
        await AsyncStorage.setItem('JWT',result.data);

        this.registerForPushNotifications();


        //Declaring a variable, status. to ask for permission for location services.
        let { status } = await Permissions.askAsync(Permissions.LOCATION);

        //If Permissions were not given, error message to display.
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied',
            });
        }

        this.setCurrentLocation();

        //Comparing Current psoition with passable objects, set to 0 for now
        if (this.state.latitude == 0 && this.state.longitude == 0) {
            this.setState({
                proximity: "yes"
            })
        }

        this.setTokens();

        this.getWaypoints();

        try {
          const HAS_LAUNCHED = 'hasLaunched';
          const OPEN_HELP = 'open_help';

          const res = await AsyncStorage.getItem(HAS_LAUNCHED
          );

          if(res === null){
            AsyncStorage.setItem(OPEN_HELP, 'true');
            AsyncStorage.setItem(HAS_LAUNCHED, 'true');
          } else {
            AsyncStorage.setItem(OPEN_HELP, 'false');
          }

          const open_help = await AsyncStorage.getItem(OPEN_HELP);
          if(open_help === 'true'){
            this.props.navigation.navigate('Help')
          }

        } catch (e) {
          console.log(e);
        }


        Location.watchPositionAsync(LOCATION_SETTINGS, location => {

            let {
                waypoints
            } = this.state;

            let {
                origin,
                destination,
                tourStarted,
                nextLocation
            } = this.state.tour


            if (waypoints != null && tourStarted) {

                let distance = getDistance(location.coords, waypoints[nextLocation - 1].location);

                if (tourStarted) {
                    let tourCopy = { ...this.state.tour }
                    tourCopy.disToLandmark = distance;
                    this.setState({ tour: tourCopy })
                }

                //console.log(distance);

                if ((distance < 20) && (waypoints[nextLocation - 1].id == nextLocation) && (!waypoints[nextLocation - 1].visited)) {

                    //¯\_(ツ)_/¯
                    const newState = JSON.parse(JSON.stringify(this.state));

                    if (nextLocation != waypoints.length) {

                      const PATTERN = [100, 500,200,600,200,500];
                      Vibration.vibrate(PATTERN);

                      const title = newState.waypoints[nextLocation - 1].title;
                      const description = newState.waypoints[nextLocation - 1].description;
                      // Works on both Android and iOS
                      Alert.alert(
                        title,
                        description.substring(0, 100) + "...",
                        [
                          {text: 'View details', onPress: () => this.props.navigation.navigate('Landmark', { landmark: newState.waypoints[nextLocation - 1] })},
                          {text: '', onPress: () => console.log('')},
                          {text: 'Continue Tour', onPress: () => console.log('Continue Tour Pressed')},
                        ],
                        {cancelable: false},
                      );

                      newState.waypoints[nextLocation - 1].visited = true;
                      newState.tour.nextLocation++;
                      newState.tour.destination = newState.waypoints[newState.tour.nextLocation - 1].location;
                      newState.tour.landmarks_visited.push({
                        "id":newState.waypoints[nextLocation - 1].id,
                        "title":newState.waypoints[nextLocation - 1].title,
                        "time_visited":getTime()
                      });

                      this.setState(newState);

                    } else {

                      const PATTERN = [100, 500,200,600,200,500];
                      Vibration.vibrate(PATTERN);
                      const title = newState.waypoints[nextLocation - 1].title;
                      const description = newState.waypoints[nextLocation - 1].description;
                      // Works on both Android and iOS
                      Alert.alert(
                        title,
                        description.substring(0, 100) + "...",
                        [
                          {text: 'View details', onPress: () => this.props.navigation.navigate('Landmark', { landmark: newState.waypoints[nextLocation - 1] })},
                          {text: '', onPress: () => console.log('')},
                          {text: 'Continue Tour', onPress: () => console.log('Continue Tour Pressed')},
                        ],
                        {cancelable: false},
                      );

                      console.log("modal view state 2: " + this.state.infoModalVisible);
                      newState.waypoints[nextLocation - 1].visited = true;
                      newState.tour.landmarks_visited.push({
                        "id":newState.waypoints[nextLocation - 1].id,
                        "title":newState.waypoints[nextLocation - 1].title,
                        "time_visited":getTime()
                      });
                      newState.tour.tour_completed = true;
                      this.setState(newState);
                    }
                }
            }

            let tourCopy = { ...this.state.tour }



            if (tourCopy.tourStarted) {


                tourCopy.origin = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                };
                this.setState({ tour: tourCopy })
            }

        });

    }

    getAsyncData = async (key) => {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value !== null) {
            return value;
          }
        } catch (error) {
          console.log(error);
        }
      };

    setCurrentLocToCarlingford = () => {

        const latitudeCarlingford= 54.041000
        const longitudeCarlingford= -6.185922
        let timer= null

        let coordCheck = false;
        if (latitudeCarlingford != this.state.latitude) {
            timer = setTimeout(() => this.showLoader, 1000);
            coordCheck == true;
        }


        this.setState({
          latitude: latitudeCarlingford,
          longitude: longitudeCarlingford
        });

        clearTimeout(timer);
        this.hideLoader();
        //wait timer
        const {
            latitude,
            longitude,
            latitudeDelta,
            longitudeDelta
        } = this.state;
        this.mapView.animateToRegion({
            latitude,
            longitude,
            latitudeDelta,
            longitudeDelta
        }, 1000)
    }

    setCurrentLocation = async () => {
        let location = await Location.getCurrentPositionAsync({});
        this.setState({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        })
    };

    getWaypoints = async () => {

        this.showLoader();

        const tourId = 1;

        Axios({
            method: "get",
            url: `https://orion-visitar.herokuapp.com/tourData?id=${tourId}`
        }).then((results) => {
            console.log("Tour Data Request Response: Fn getWaypoints")

            let waypointArr = [];

            for (let waypoint of results.data.tourStops) {
                waypointArr.push({
                    "id": waypoint.id,
                    "visited": false,
                    "title": waypoint.name,
                    "description": waypoint.history,
                    "image": waypoint.image,
                    "fact": waypoint.fact,
                    "icon":waypoint.icon,
                    "location": {
                        "latitude": waypoint.location._latitude,
                        "longitude": waypoint.location._longitude
                    }
                })
            }

            this.setState({
                waypoints: waypointArr
            })

            this.hideLoader();
        })
    }

    recenter = () => {
        console.log("Re Centering the User")
        this.setCurrentLocation();
        let coordCheck = false;
        if (latitude == this.state.latitude) {
            this.showLoader();
            coordCheck == true;
        }
        const {
            latitude,
            longitude,
            latitudeDelta,
            longitudeDelta
        } = this.state;
        this.mapView.animateToRegion({
            latitude,
            longitude,
            latitudeDelta,
            longitudeDelta
        }, 1000)
        if (coordCheck == true) {setTimeout(this.hideLoader, 2000);}
    }

    postTour = async () => {

      this.showLoader();

      const res = await Axios({
          method: "post",
          url: "https://orion-visitar.herokuapp.com/tourlog",
          data: this.state.tour
      });


      this.hideLoader();
    }

    endTour = async () => {

        this.showLoader();

        //¯\_(ツ)_/¯
        const newState = JSON.parse(JSON.stringify(this.state));

        newState.tour.origin = null;
        newState.tour.destination = null;
        newState.tour.tourStarted = false;
        newState.tour.time_finished = getTime();
        newState.tour.tokens_collected = this.state.num_of_tokens;
        newState.uiState = 0;


        const uid = await getUserID();


        //this.setState(newState);

        this.setState(newState, async () => {
          await this.postTour();
          this.hideLoader();
          this.props.navigation.navigate("EndTour", {
            tour: newState.tour,
            tokens: this.state.num_of_tokens
          });
        });
    }

    toStart = () => {
        this.showLoader();

        let tour = { ...this.state.tour }
        tour.origin = {
            "latitude": this.state.latitude,
            "longitude": this.state.longitude
        }
        tour.destination = this.state.waypoints[0].location;
        tour.tourStarted = true;

        tour.date         = getDate();
        tour.time_started = getTime();

        this.setState({
            tour,
            uiState: 1
        })
        this.hideLoader();
    }

    skipLocation = () => {
      const newState = JSON.parse(JSON.stringify(this.state));
      newState.tour.nextLocation++;
      newState.tour.destination = newState.waypoints[newState.tour.nextLocation - 1].location;
      this.setState(newState);
    }

    showLoader = () => this.setState({ showLoader: true });

    hideLoader = () => this.setState({ showLoader: false });

    setTokens = ()  => {
        navigator.geolocation.getCurrentPosition(
            position => {
                //comparring my current geo location with the location of the tokens in Carlingford.
              //spout token
                if(tokens[0]!=99999999){
                tokens[0] = getPreciseDistance(

                { latitude: position.coords.latitude, longitude: position.coords.longitude },
                { latitude: 54.04207, longitude: -6.18787 }
              );
              this.setState({token1});

               }
            //stone head
               if(tokens[1]!=99999999){
                tokens[1] = getPreciseDistance(

                { latitude: position.coords.latitude, longitude: position.coords.longitude },
                { latitude: 54.04198, longitude: -6.187025 }
              );
               this.setState({token2});

               }
               //token that is not on the route (birthplace of darcey magee)

               if(tokens[2]!=99999999){
                tokens[2] = getPreciseDistance(

                  { latitude: position.coords.latitude, longitude: position.coords.longitude },
                  { latitude: 54.039403, longitude: -6.186478 }
                );
              this.setState({token3});

               }

               //abbey
               if(tokens[3]!=99999999){
                tokens[3] = getPreciseDistance(

                  { latitude: position.coords.latitude, longitude: position.coords.longitude },
                  { latitude: 54.038039, longitude: -6.185042 }
                );
              this.setState({token4});

               }

               //heritage ceentre
               if(tokens[4]!=99999999){
                tokens[4] = getPreciseDistance(

                  { latitude: position.coords.latitude, longitude: position.coords.longitude },
                  { latitude: 54.038039, longitude: -6.185042}
                );
              this.setState({token5});

               }
                //town gaol
               if(tokens[5]!=99999999){
                tokens[5] = getPreciseDistance(

                  { latitude: position.coords.latitude, longitude: position.coords.longitude },
                  { latitude: 54.039855, longitude: -6.185469 }
                 
                );
              this.setState({token6});

               }
               //the mint

               if(tokens[6]!=99999999){
                tokens[6] = getPreciseDistance(

                  { latitude: position.coords.latitude, longitude: position.coords.longitude },
                  { latitude:54.040183, longitude: -6.186233 }
                );
              this.setState({token7});

               }
               //taffes castle
               if(tokens[7]!=99999999){
                tokens[7] = getPreciseDistance(

                  { latitude: position.coords.latitude, longitude: position.coords.longitude },
                  { latitude: 54.040703, longitude:-6.186455 }
                );
              this.setState({token8});

               }

               if(tokens[8]!=99999999){
                tokens[8] = getPreciseDistance(

                  { latitude: position.coords.latitude, longitude: position.coords.longitude },
                  //test value close to my house(emma)
                 // { latitude: 54.191527, longitude:-6.399936}

                  { latitude: 54.038969, longitude:-6.185382}
                );
              this.setState({token8});

               }




               error => Alert.alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            }
        )

    }

    TokenGame = () => {

            this.setTokens();
            console.log(tokens);


			//calculating what the closts token is
			 closestToken = Math.min(...tokens) // 1
            this.setState({closestToken});

			 //num_of_tokens=0;

             //for each token , check that the closest token is less than 5 meters( for testing i use a larger number)

             if(closestToken>7000){
                 //alert("You must be Carlingford town to pick up tokens.\nCome on down and see the wonders of Carlingford!")
                /* Alert.alert(
                   'Token game',
                   'You must be Carlingford town to pick up tokens.\nCome on down and see the wonders of Carlingford!"',
                   [
                     {text: 'OK', onPress: () => console.log('OK Pressed')},
                   ],
                   {cancelable: false},
                 );*/

                 this.setModalVisible("tokenInfoVisible");
             }
             else if (closestToken <=20 && this.state.num_of_tokens<=6 )//change closest toke to <=20 for release
             {
             //for loop to run through all of the tokens, to see if there is a token that matches the closest token
        				for( var i=0; i<tokens.length; i++)
        				{
      						//match the closest distance with the relevant token
      						if(tokens[i]==closestToken)
      						{
                                  //add a token to the count of tokens
                                  let token_num = this.state.num_of_tokens;
                                  if(token_num<6)
                                  {
                                  token_num++;
                                  }
      							                     this.setState({num_of_tokens: token_num});
                                  //this.setState({num_of_tokens});

                                  var token_number=tokens.indexOf(closestToken);
                                  if(this.state.num_of_tokens+1<6 ){
                                  this.setModalVisible("tokenUpdate");
                                  Speech.speak('congratulations! you have found ' + (this.state.num_of_tokens + 1) +' of 6 tokens');
                                  }
                                  else if(token_num==6)
                                  {
                                      Speech.speak('You have found all 6 tokens!, Congratulations!');
                                      this.setModalVisible("tokenCollect");
                                      //alert('you have found all 6 tokens! Congratuations!');
                                    /*  Alert.alert(
                                        'Token game',
                                        'you have found all 6 tokens!\nCongratuations!',
                                        [
                                          {text: 'OK', onPress: () => console.log('OK Pressed')},
                                        ],
                                        {cancelable: false},
                                      );*/
                                  }

                                  //reset the token distance to 9999999 (a number that should always be bigger than the rest)and so that it will never be the minimum as above
                                  if(token_num<6)
                                  {
      							const index = tokens.indexOf(tokens[i]);
      							if (index !== -1)
      							{
         							 tokens[index] = 99999999;
                                  }
                              }

                                  this.setState({tokens})	;
                                  console.log("tokens modified")
                                  this.setTokens();
                                  console.log(tokens);
      						}
                    }

                }

                else{
                    if(this.state.num_of_tokens<6){
                      let tknDistance ="" +  closestToken + "m from the closest token!\nThey are located at each landmark, and marked by a blue plaque, can you find it?";
                      this.setModalVisible("distanceTokenModal");
                    //nearest_token=("you are " + closestToken + " from the closest token!")
                    //alert("you are " + closestToken + "m from the closest token! They are located at each landmark, can you find it?");
      /*              Alert.alert(
                      "Distance from nearest token",
                      tknDistance,
                      [
                        {text: 'Token game?', onPress: () => this.props.navigation.navigate('Help')},
                        {text:''},
                        {text: 'I will go look now!', onPress: () => console.log('YES Pressed')},
                      ],
                      {cancelable: false},
                    );
                    */
                    }


       // this.setState({nearest_token});
                }





	  }


    registerForPushNotifications = async () =>{
        //check for permissions...
        const {status} = await Permissions.getAsync(Permissions.NOTIFICATIONS);
        let finalStatus = status;

        //if no existing permissions, ask user for permissions...
        if(status != 'granted'){
            const {status} = await Permissions.askAsync.NOTIFICATIONS;
            finalStatus = status;
        }

        //if no permissions, exit the function....
        if(finalStatus != 'granted') {return}

        //get push notification token...
        let token = await Notifications.getExpoPushTokenAsync();
        console.log(token);
    }

    setModalVisible = (term) => {
      //console.log("modal called and it is set to: " + this.state.modalVisible);
      term==="tokenUpdate"?
      this.setState({
        tokenUpdateVisible:!this.state.tokenUpdateVisible
      })
      :
      term==="tokenCollect"?
      this.setState({
        tokenCollectVisible:!this.state.tokenCollectVisible
      })
      :
      term==="tokenInfoVisible"?
      this.setState({
        tokenInfoVisible:!this.state.tokenInfoVisible
      })
      :
      term==="distanceTokenModal"?
      this.setState({
        distanceTokenModal:!this.state.distanceTokenModal
      })
      :
      null
    }


    render() {
        let {
            latitude,
            longitude,
            waypoints
        } = this.state

        let {
            origin,
            destination,
            tourStarted,
            disToLandmark
        } = this.state.tour

        return (
            this.state.latitude ?
                <View data-test="GoogleMaps_ScreenView" style={styles.container}>


                    <View>
                        <StatusBar hidden={true} />
                    </View>



                    {/* <TouchableHighlight
                        style={{
                                 justifyContent: 'center',
                        alignItems: 'center',
                        height: 60,
                        backgroundColor: '#4B6296',
                        margin: 10,
                        top:10,}}
                        onPress={() => {
                            this.TokenGame();
                        }}>
                        <Text style={{top:5, color:"white"}}>Pick up token</Text>

                    </TouchableHighlight> */}

                    {/* <Progress.Bar progress={num_of_tokens / 4} width={200} /> */}

                    <MapView
                        ref={(ref) => this.mapView = ref}
                        showsUserLocation
                        followsUserLocation
                        showsScale
                        data-test="MapView"
                        style={styles.mapStyle}
                        customMapStyle={mapStyle}
                        initialRegion={{
                            latitude: 54.041000,
                            longitude: -6.185922,
                            latitudeDelta: this.state.latitudeDelta,
                            longitudeDelta: this.state.longitudeDelta}}
                    >
                        {tourStarted && (
                          <MapViewDirections
                              origin={origin}
                              destination={destination}

                              resetOnChange={false}
                              apikey={GOOGLE_MAPS_APIKEY}
                              strokeWidth={10}
                              strokeColor="#cf1717"
                              mode="WALKING"
                              precision="low"
                          />
                        ) }


                        {//destination && <MapView.Marker
                            //    coordinate={destination}
                            //  icon={require('../../assets/PointOfInterestIcon.png')}/>
                        }

                        {
                            // start marker for before tour starts
                            this.state.tour.tourStarted ?
                                      null
                                      :
                            <Marker
                            coordinate={{
                              latitude: 54.040721,
                              longitude: -6.185286
                            }}
                            key={"Visit Carlingford Location"}
                            >
                            <Image source={require('../../assets/mapIcons/vc.png')} style={{height: 64, width:64 }} />
                            <Callout>
                            <View>
                              <CustomMarker title="Visit Carlingford" description="Visit Carlingford tourist Office and tour start location" />
                            </View>
                            </Callout>
                            </Marker>
                        }





                        {tourStarted && waypoints.map((waypoint, index) =>



                        //  icon={waypoint.visited ?
                        //      require('../../assets/PointOfInterestIconVisite.png')
                        //      :
                        //      require('../../assets/PointOfInterestIcon.png')
                        //  }
                            <Marker
                                coordinate={waypoint.location}
                                key={waypoint.title}
                            >

                            {waypoint.icon ==="castle" ?
                              waypoint.visited ?
                               <Image source={Images.castleVisited} style={styles.iconStyle}/>
                               :
                               <Image source={Images.castle} style={styles.iconStyle}/>
                               :
                               null
                            }
                            {waypoint.icon ==="spout" ?
                              waypoint.visited ?
                               <Image source={Images.spoutVisited} style={styles.iconStyle}/>
                               :
                               <Image source={Images.spout} style={styles.iconStyle}/>
                               :
                               null
                            }
                            {waypoint.icon ==="face" ?
                              waypoint.visited ?
                               <Image source={Images.faceVisited} style={styles.iconStyle}/>
                               :
                               <Image source={Images.face} style={styles.iconStyle}/>
                               :
                               null
                            }
                            {waypoint.icon ==="taffe" ?
                              waypoint.visited ?
                               <Image source={Images.taffeVisited} style={styles.iconStyle}/>
                               :
                               <Image source={Images.taffe} style={styles.iconStyle}/>
                               :
                               null
                            }
                            {waypoint.icon ==="abbey" ?
                              waypoint.visited ?
                               <Image source={Images.abbeyVisited} style={styles.iconStyle}/>
                               :
                               <Image source={Images.abbey} style={styles.iconStyle}/>
                               :
                               null
                            }
                            {waypoint.icon ==="centre" ?
                              waypoint.visited ?
                               <Image source={Images.centreVisited} style={styles.iconStyle}/>
                               :
                               <Image source={Images.centre} style={styles.iconStyle}/>
                               :
                               null
                            }
                            {waypoint.icon ==="thosel" ?
                              waypoint.visited ?
                               <Image source={Images.thoselVisited} style={styles.iconStyle}/>
                               :
                               <Image source={Images.thosel} style={styles.iconStyle}/>
                               :
                               null
                            }
                            {waypoint.icon ==="mint" ?
                              waypoint.visited ?
                               <Image source={Images.mintVisited} style={styles.iconStyle}/>
                               :
                               <Image source={Images.mint} style={styles.iconStyle}/>
                               :
                               null
                            }
                            {waypoint.icon ==="bust" ?
                              waypoint.visited ?
                               <Image source={Images.bustVisited} style={styles.iconStyle}/>
                               :
                               <Image source={Images.bust} style={styles.iconStyle}/>
                               :
                               null
                            }
                                <Callout
                                    onPress={e => {
                                        this.props.navigation.navigate('Landmark', { landmark: waypoint });
                                    }
                                    }>
                                    <InfoPopUp title={waypoint.title} description={waypoint.description} />
                                </Callout>
                            </Marker>)}
                    </MapView>


                    {this.state.showLoader && (
                        <Spinner
                            visible={true}
                            textContent={"Getting Route..."}
                            textStyle={styles.spinnerTextStyle}
                        />
                    )}
                    {this.state.tour.tourStarted?


                      <TouchableOpacity style={{
                          position: "absolute",
                          bottom: 150,
                          alignSelf: 'center',
                          left: 20
                      }}
                          onPress={ () => this.skipLocation()}
                      >
                          <View data-test="Screen_Recenter_Button"
                              style={{
                                  borderWidth: 0.1,
                                  borderColor: '#e4d9c0',
                                  borderRadius: 75,
                                  overflow: 'hidden',
                                  height: 70,
                                  width: 70,
                                  backgroundColor: '#4c6294',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderBottomWidth: 3,
                                  borderColor: "black"
                              }}>
                                  <Image
                                      style={{ width: 35, height: 35, alignItems: "center", justifyContent: "center" }}
                                      source={require('../../assets/skip.png')}
                                  />
                          </View>
                      </TouchableOpacity>
                  :
                  null}

                  {this.state.tour.tourStarted?
                    <View style={{
                        top:10,
                        position: "absolute",
                        alignItems:'center',
                        borderRadius:15,
                        backgroundColor:"#e7e7e6",
                        padding:3
                      }}>

                      <Text  style={{
                          fontSize:35,
                          textAlign:'center',
                          color:'#4B6296',
                          opacity:1
                      }}>{disToLandmark}m</Text>
                      <Text  style={{
                          fontSize:22,
                          textAlign:'center',
                          color:'#4B6296',
                          opacity:1
                      }}>To next Landmark</Text>
                    </View>
                    :
                    null
                  }


                    <UserInterface
                        CallStartTour={this.toStart.bind(this)}
                        CallReCenter={this.recenter.bind(this)}
                        endTour = {this.endTour.bind(this)}
                        setCurrentLocToCarlingford={this.setCurrentLocToCarlingford.bind(this)}
                        status={this.state.uiState}
                        tokenGame={this.TokenGame.bind(this)}
                        num_tokens = {this.state.num_of_tokens}
                        //distnaceBetweenLocationAndTokens={this.distnaceBetweenLocationAndTokens.bind(this)}
                    />


                    <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.tokenUpdateVisible}
                    onRequestClose={() => {
                      console.log('Modal has been closed.');
                    }}>
                    <View style={styles.modalOuter}>
                        <View style={styles.modalInner}>
                        <Text style={styles.contentText}>
                                    You have collected a token!
                                  </Text>
                                  <Text style={styles.contentText}>
                                              {this.state.num_of_tokens} out of 6 so far!
                                            </Text>
                                <TouchableHighlight
                                  onPress={() => {
                                    this.setModalVisible("tokenUpdate");
                                  }}>
                                  <Text
                                    style={styles.closeText}
                                    >Close</Text>
                                </TouchableHighlight>
                        </View>
                      </View>
                  </Modal>

                  <Modal
                  animationType="fade"
                  transparent={true}
                  visible={this.state.tokenCollectVisible}
                  onRequestClose={() => {
                    console.log('Modal has been closed.');
                  }}>
                  <View style={styles.modalOuter}>
                      <View style={styles.modalInner}>
                         <Text style={styles.contentText}>
                                  You have found all {this.state.num_of_tokens} tokens.
                        </Text>
                        <Text style={styles.contentText}>
                                 Congratulations!
                        </Text>
                        <TouchableHighlight
                               onPress={() => {
                                  this.setModalVisible("tokenCollect");
                                }}>
                                <Text
                                  style={styles.closeText}
                                  >Close</Text>
                              </TouchableHighlight>
                      </View>
                    </View>
                </Modal>

                <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.tokenInfoVisible}
                onRequestClose={() => {
                  console.log('Modal has been closed.');
                }}>
                <View style={styles.modalOuter}>
                    <View style={styles.modalInnerInfo}>
                       <Text style={styles.contentText}>
                            You must be Carlingford town to pick up tokens.{"\n"}Come on down and see the wonders of Carlingford!
                      </Text>

                      <TouchableHighlight
                             onPress={() => {
                                this.setModalVisible("tokenInfoVisible");
                              }}>
                              <Text
                                style={styles.closeText}
                                >Close</Text>
                            </TouchableHighlight>
                    </View>
                  </View>
              </Modal>

              <Modal
              animationType="fade"
              transparent={true}
              visible={this.state.distanceTokenModal}
              onRequestClose={() => {
                console.log('Modal has been closed.');
              }}>
              <View style={styles.modalOuter}>
                  <View style={styles.modalInnerInfoDistance}>
                     <Text style={styles.contentTextDistance}>
                          {closestToken}m{"\n"}From the nearest token!{"\n"}They are located at each landmark, and marked by a blue plaque.{"\n"} can you find it?
                    </Text>

              <TouchableHighlight
                     onPress={() => {
                        this.setModalVisible("distanceTokenModal");this.props.navigation.navigate('Help');
                      }}>
                      <Text
                        style={styles.closeText}
                        >Token?</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                           onPress={() => {
                              this.setModalVisible("distanceTokenModal");
                            }}>
                            <Text
                              style={styles.closeText}
                              >Close</Text>
                          </TouchableHighlight>
                  </View>
                </View>
            </Modal>


                </View >
                :
                <View style={{ flex: 1, alignItems: 'center' }} data-test="Alt_View">
                    <AnimatedLoadingBar data-test="Loading_Bar" />
                </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#e4d9c0",
        alignItems: "center",
        justifyContent: "center"

    },
    mapStyle: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height
    },
    overlayButton: {
        position: "absolute",
        bottom: 140,
        alignSelf: 'center'
    },
    ovewrlayView: {
        position: "absolute", //use absolute position to show button on top of the map
        top: "0%", //for center align
        alignSelf: 'center'
    },
    buttonStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        backgroundColor: '#4B6296',
        margin: 10,
    },
    iconStyle: {
        width:48,
        height:48
    },
    modalOuter:{
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#00000080',
      margin:0
    },
    modalInner:{
      width: Dimensions.get('window').width * 0.8,
      height: Dimensions.get('window').height * 0.2,
      backgroundColor: '#EBD5B3',
      padding: 20,
      borderRadius:15
    },
    modalInnerInfo:{
      width: Dimensions.get('window').width * 0.8,
      height: Dimensions.get('window').height  * 0.25,
      backgroundColor: '#EBD5B3',
      padding: 20,
      borderRadius:15
    },
    modalInnerInfoDistance:{
      width: Dimensions.get('window').width * 0.8,
      height: Dimensions.get('window').height * 0.4,
      backgroundColor: '#EBD5B3',
      padding: 20,
      borderRadius:15
    },
    closeText:{
      fontSize:30,
      fontWeight:'bold',
      textDecorationLine:'underline',
      textAlign:'center',
      marginTop:5
    },
   contentText:{
     fontSize:22,
     textAlign:'center'
   },
   distance_text: {

   },
   contentTextDistance:{
     fontSize:24,
     textAlign:'center'
   }
});

const mapStyle = [{
    elementType: "geometry",
    stylers: [{
        color: "#e4d9c0"
    }]
},
{
    elementType: "labels.text.fill",
    stylers: [{
        color: "#523735"
    }]
},
{
    elementType: "labels.text.stroke",
    stylers: [{
        color: "#f5f1e6"
    }]
},
{
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{
        color: "#c9b2a6"
    }]
},
{
    featureType: "administrative.land_parcel",
    elementType: "geometry.stroke",
    stylers: [{
        color: "#dcd2be"
    }]
},
{
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{
        color: "#ae9e90"
    }]
},
{
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{
        color: "#e4d9c0"
    }]
},
{
    featureType: "poi",
    elementType: "geometry",
    stylers: [{
        color: "#e4d9c0"
    }]
},
{
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{
        color: "#93817c"
    }]
},
{
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{
        color: "#a5b076"
    }]
},
{
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{
        color: "#447530"
    }]
},
{
    featureType: "road",
    elementType: "geometry",
    stylers: [{
        color: "#f5f1e6"
    }]
},
{
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{
        color: "#fdfcf8"
    }]
},
{
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{
        color: "#f8c967"
    }]
},
{
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{
        color: "#e9bc62"
    }]
},
{
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [{
        color: "#e98d58"
    }]
},
{
    featureType: "road.highway.controlled_access",
    elementType: "geometry.stroke",
    stylers: [{
        color: "#db8555"
    }]
},
{
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{
        color: "#806b63"
    }]
},
{
    featureType: "road",
    elementType: "labels",
    stylers: [{
        visibility: "off"
      }]
},
{
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{
        color: "#e4d9c0"
    }]
},
{
    featureType: "transit.line",
    elementType: "labels.text.fill",
    stylers: [{
        color: "#8f7d77"
    }]
},
{
    featureType: "transit.line",
    elementType: "labels.text.stroke",
    stylers: [{
        color: "#ebe3cd"
    }]
},
{
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{
        color: "#e4d9c0"
    }]
},
{
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{
        color: "#b9d3c2"
    }]
},
{
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{
        color: "#92998d"
    }]
},


];
