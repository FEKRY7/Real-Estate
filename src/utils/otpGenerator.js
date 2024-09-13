const otpGenerator = require('otp-generator');
const moment = require('moment');

// nu: Number of OTP digits, mins: Minutes until expiration
const OTPGeneratorFn = () => {
    // Parse and validate the OTP length from environment variables
    const otpLength = parseInt(process.env.OTPNUMBERS, 3); 
    const OTP = {
      OTPCode: otpGenerator.generate(otpLength, {
        upperCaseAlphabets: false,
        specialChars: false,
      }),
      expireDate: moment().add(2, 'minutes').toDate(), // Convert moment to Date object
    };
  
    return OTP;
};

module.exports = OTPGeneratorFn;
