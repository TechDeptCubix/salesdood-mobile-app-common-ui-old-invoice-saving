import React, { useRef } from 'react';
import { View, Button, Alert, Platform } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';

const SignaturePad = (props) => {

    const { setSignature_1, setSignature_2, setSignature_3, setSignature_4 , currentSignPersonNumber} = props
    const signatureRef = useRef(null);

    const handleSignature = (signature) => {
        // ✅ Base64 signature
        console.log('Signature base64:', signature);
        if(currentSignPersonNumber==1){
            setSignature_1(signature)
        }else if(currentSignPersonNumber==2){
            setSignature_2(signature)
        }else if(currentSignPersonNumber==3){
            setSignature_3(signature)
        }else if(currentSignPersonNumber==4){
            setSignature_4(signature)
        }
       
        Alert.alert('Signature Captured');

        // ✅ Manually clear only after saving
        signatureRef.current.clearSignature();
    };

    const handleClear = () => {
        signatureRef.current.clearSignature();
    };

    const handleEmpty = () => {
        Alert.alert('No Signature', 'Please draw something first.');
    };

    // ✅ JavaScript to fix first-stroke bug when autoClear is false
    const injectedJS = `
    setTimeout(() => {
      if (window.signaturePad) {
        window.signaturePad.clear();
      }
    }, 300);
    true;
  `;

    return (
        <View style={{ flex: 1 }}>
            <SignatureScreen
                ref={signatureRef}
                onOK={handleSignature}
                onEmpty={handleEmpty}
                onClear={() => console.log('Signature manually cleared')}
                autoClear={false} // ✅ Keeps drawing after save
                descriptionText="Sign above"
                webStyle={`
          .m-signature-pad--footer { display: none; }
          .m-signature-pad { flex: 1; }
        `}
                injectedJavaScript={injectedJS} // ✅ Fixes first stroke
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', margin: 16 }}>
                <Button title="Save" onPress={() => signatureRef.current.readSignature()} />
                <Button title="Clear" onPress={handleClear} />
            </View>
        </View>
    );
};

export default SignaturePad;
