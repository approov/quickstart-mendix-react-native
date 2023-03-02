// *** COMMENT OUT THE LINE BELOW TO USE APPROOV ***
// export {}

// *** UNCOMMENT THE LINES BELOW TO USE APPROOV ***
import { NativeModules } from 'react-native'
const { ApproovService } = NativeModules

try {
    ApproovService.initialize("<enter-your-config-string-here>")
} catch (e) {
    // Approov doesn't attest mobile apps that are running against an API backend in localhost.
    // So, do nothing or add logging if you prefer. 
}

export {ApproovService}
