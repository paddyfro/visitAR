import React, { Component } from 'react'
import { TouchableOpacity, View, Text, Button, Image, Modal, TouchableHighlight, Dimensions, StyleSheet } from 'react-native'
import HelpInfoButton from "../Components/HelpInfoButton"
import MenuButton from "../Components/MenuButton"
import { withNavigation } from 'react-navigation';
import PickUpTokenButton from "../Components/PickUpTokenButton";
//import tokenGame from "../screens/GoogleMapsScreen";


HideStartedTourReCenterButton = (props) => {
    if (props.status == 0) {
        return (
            <View data-test="ButtonView" style={{
                position: "absolute",
                bottom: 150,
                alignSelf: 'center'
            }}>

                <Button
                    title="Re-Center"
                    data-test="Screen_Recenter_Button"
                    onPress={props.CallReCenter}
                />

            </View>
        )
    } else {
        return null
    }

}


ShowEndTourButton = (props) => {
    if (props.status == 1) {
        return (
            <TouchableOpacity
                onPress={props.endTour}
                //onPress={props.navigation.navigate("EndTourScreen")}
               // onPress={() => props.navigation.navigate("EndTourScreen")}
                style={{
                    position: "absolute",
                    top:"3%",
                    alignItems: "center"
                }}
               // onPress={()=>{alert("this is the end screen")}}
                //      || props.navigation.navigate("EndTourScreen")
                >

                <View
                    style={{
                        height: 60,
                        width: 150,
                        backgroundColor: '#4c6294',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 1,
                        borderWidth: 0.1,
                        borderBottomWidth: 3,
                        borderColor: "black"
                    }}>
                    <Text style={{
                        color: "white",
                        fontSize: 30,
                        textAlign: "center"
                    }}>End Tour
                </Text>
                </View>

            </TouchableOpacity>
        )
    } else {
        return null
    }

}






class UserInterface extends Component {

    constructor(props) {
        super(props)
        this.state = {
          modalVisible:false,
            uiState:
                [{
                    onPress: this.props.CallStartTour,
                    height: 150,
                    width: 150,
                    color: "white",
                    text: "Start Tour",
                    fontsize: 25,
                    showView: true,
                    right: null
                },
                {
                    onPress: this.props.CallReCenter,
                    height: 70,
                    width: 70,
                    color: "white",
                    text: "",
                    fontsize: 22,
                    showView: false,
                    right: 20
                }]
        }
    }
    setModalVisible = () => {
      //console.log("modal called and it is set to: " + this.state.modalVisible);
      this.setState({
        modalVisible:!this.state.modalVisible
      })
    }

    render(props) {
        return (
            <>




                <HelpInfoButton style={{
                    position: "absolute",
                    top: 15,
                    alignSelf: 'right'
                }} navName="Help" />



                <MenuButton style={{
                    position: "absolute",
                    top: 10,
                    alignSelf: 'left'
                }} navName="Menu" />


                {this.props.status == 0 ?
                   <PickUpTokenButton top="5%" pickUpTokenGame = {this.props.tokenGame} num_tokens = {this.props.num_tokens}/>
                   :
                    <PickUpTokenButton top="85%" pickUpTokenGame = {this.props.tokenGame} num_tokens = {this.props.num_tokens}/>}
                {/*<PickUpTokenButton
                top="5%"
                pickUpTokenGame = {this.props.tokenGame}
                num_tokens = {this.props.num_tokens}
                />*/}






                <TouchableOpacity
                  onPress={() => { this.setModalVisible() }}
                  style={{
                       position: "absolute",
                       left:Dimensions.get('window').width * 0.85,
                       top :180,
                  }}
                  >
                  <Image
                    source={{uri:'https://firebasestorage.googleapis.com/v0/b/orion-57b76.appspot.com/o/tokens%2F1.png?alt=media&token=e1b0139d-769f-4438-8f3a-0e5fe7386c34'}}
                    style={{
                       width: 50,
                       height: 300,
                       resizeMode: 'stretch'
                     }}
                />
                </TouchableOpacity>




                {/* <HideStartedTourReCenterButton status={this.props.status} CallStartTour={this.props.CallStartTour} /> */}
                <ShowEndTourButton status={this.props.status} endTour={this.props.endTour} />

                <TouchableOpacity style={{
                    position: "absolute",
                    bottom: 30,
                    alignSelf: 'center',
                    left: 20
                }}
                    onPress={this.props.setCurrentLocToCarlingford}
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
                                source={require('../../assets/home.png')}
                            />
                    </View>
                </TouchableOpacity>


                <TouchableOpacity style={{
                    position: "absolute",
                    bottom: 30,
                    alignSelf: 'center',
                    right: this.state.uiState[this.props.status].right
                }}
                    onPress={this.state.uiState[this.props.status].onPress}
                >

                    <View data-test="Screen_Recenter_Button"
                        style={{
                            borderWidth: 0.1,
                            borderColor: '#e4d9c0',
                            borderRadius: 75,
                            overflow: 'hidden',
                            height: this.state.uiState[this.props.status].height,
                            width: this.state.uiState[this.props.status].width,
                            backgroundColor: '#4c6294',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderBottomWidth: 3,
                            borderColor: "black"
                        }}>
                        {/* Global Text props should be used here!! */}
                        {this.props.status == 0 ?
                            <Text style={{
                                color: this.state.uiState[this.props.status].color,
                                fontSize: this.state.uiState[this.props.status].fontsize
                            }}>{this.state.uiState[this.props.status].text}</Text> :
                            <Image
                                style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
                                source={require('../../assets/recenter.png')}
                            />}
                    </View>
                </TouchableOpacity>

                <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                  console.log('Modal has been closed.');
                }}>
                <View style={styles.modalOuter}>
                    <View style={styles.modalInner}>
                            <Text>Number of tokens you have collected so far, collect more at each landmark to fill up all the slots</Text>
                            <TouchableHighlight
                              onPress={() => {
                                this.setModalVisible();
                              }}>
                              <Text
                                style={{fontSize:22, fontWeight:'bold'}}
                                >Close</Text>
                            </TouchableHighlight>
                    </View>
                  </View>
              </Modal>

            </>
        )
    }
}
export default withNavigation(UserInterface)


const styles = StyleSheet.create({
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
    width: Dimensions.get('window').width * 0.5,
    height: Dimensions.get('window').height * 0.3,
    backgroundColor: '#fff',
    padding: 20
    }
});
