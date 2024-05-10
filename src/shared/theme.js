import { extendTheme } from "@chakra-ui/react";

const Button = {
    variants:{
      'main':{
        bg: '#0b84f6',
        color:'#fff'
      },
      'secondary':{
        bg: '#649a97',
        color:'#fff'
      },
      'tertiary':{
        bg: '#f08389',
        color:'#fff'
      }
    }
}
const colors = {
  primary: {
    100: "#0f4c8e",
    200: "#25463e",
    300: "#f08389",
    400: "#0b84f6",
    500: "#649a97",
    600: "#aeccd4",
  }
};

export const theme = extendTheme({
    styles:{
      global:{
        body:{
          bg:"primary.600"
        }
      }
    },
    components: {
      Button
    },
    colors
  });


  