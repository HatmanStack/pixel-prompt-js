import { StyleSheet, Switch, View, Text, Dimensions } from "react-native";


export default function SafteySwitch({
  settingSwitch,
  setSettingSwitch,
  setPlaySound
}) {

  const windowWidth = Dimensions.get('window').width;
  const settingSwitchFunction = () => {
    setSettingSwitch(!settingSwitch);
    setPlaySound("switch");
  };

      
  return (
   
           
    <View style={[
      styles.columnContainer,
      // Apply conditional right margin based on screen width
      windowWidth > 1000 ? { marginRight: 100 } : {marginTop: -10}
    ]}>
            <Switch
      trackColor={{ false: "#958DA5", true: "#767577" }}
      thumbColor="#B58392"
      activeThumbColor="#6750A4"
      ios_backgroundColor="#3e3e3e"
      onValueChange={settingSwitchFunction}
      value={settingSwitch}
    />
              <Text
                style={[
                  { color: settingSwitch ? "#9FA8DA" : "#FFFFFF" },
                  styles.sliderText,
                ]}
              >
                Saftey
              </Text>
              
            </View>
          
  );
}

const colors = {
  borderBottomColor: "#9DA58D",
  color: "#FFFFFF",
};
const styles = StyleSheet.create({
  
  placeholderStyle: {
    color: colors.color,
    fontSize: 25,
    fontFamily: "Sigmar",
    textAlign: "center",
    letterSpacing: 3,
  },
  columnContainer: {
    margin: 20,
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
  },
  sliderText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 2,
    lineHeight: 30,
    fontFamily: "Sigmar",
  },
 
  selectedTextStyle: {
    color: colors.color,
    fontSize: 20,
    fontFamily: "Sigmar",
    letterSpacing: 3,
    textAlign: "center",
  },
});
