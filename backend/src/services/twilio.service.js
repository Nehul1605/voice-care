import twilio from 'twilio';
import 'dotenv/config';
import { ApiError } from '../utils/ApiError.js';

const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC_MOCK';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'MOCK';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

// Note: initialize twilio with mock if keys aren't present to prevent immediate crashes in dev
const client = twilio(accountSid, authToken);

/**
 * Trigger an outbound call to a patient and connect it to the Ultravox webhook stream
 * @param {string} toPhoneNumber - Patient's phone number
 * @param {string} patientId - Internal DB Id to track the call
 */
export const makeOutboundCall = async (toPhoneNumber, patientId) => {
    try {
        if (!process.env.TWILIO_ACCOUNT_SID) {
            console.warn("⚠️  WARNING: Twilio credentials missing, skipping actual call.");
            return { sid: 'MOCK_CALL_SID_' + Date.now() };
        }

        // TwiML instructs Twilio to connect the call to a media stream (Ultravox integration)
        const call = await client.calls.create({
            to: toPhoneNumber,
            from: twilioPhoneNumber,
            // Twilio TwiML that connects the audio to Ultravox WebSockets
            url: `${process.env.BACKEND_URL}/api/webhooks/twilio/twiml?patient_id=${patientId}`,
            statusCallback: `${process.env.BACKEND_URL}/api/webhooks/twilio/status`,
            statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        });

        console.log(`[Twilio] Call initiated to ${toPhoneNumber}. Call SID: ${call.sid}`);
        return call;
    } catch (error) {
        console.error("[Twilio Service Error]", error);
        throw new ApiError(500, "Failed to initiate outbound call via Twilio", [error.message]);
    }
};

/**
 * Send an SMS Alert to a doctor for High/Critical patient
 */
export const sendSMSAlert = async (doctorPhoneNumber, patientName, riskLevel, symptoms) => {
    try {
        if (!process.env.TWILIO_ACCOUNT_SID) {
            console.warn("⚠️  WARNING: Twilio credentials missing, skipping SMS alert.");
            return { sid: 'MOCK_SMS_SID_' + Date.now() };
        }

        const body = `🚨 URGENT: Patient ${patientName} flagged as ${riskLevel.toUpperCase()} risk.\nSymptoms detected: ${(symptoms || []).join(', ')}.\nPlease check the dashboard immediately.`;
        
        const message = await client.messages.create({
            body,
            from: twilioPhoneNumber,
            to: doctorPhoneNumber
        });
        
        console.log(`[Twilio] Alert SMS sent to Doctor. SID: ${message.sid}`);
        return message;
    } catch (error) {
        console.error("[Twilio Sender Error]", error);
        throw new ApiError(500, "Failed to send SMS Alert", [error.message]);
    }
};
