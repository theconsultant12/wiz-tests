/**
 * @file HABroker_Enterprise_Telemetry_Legacy_System_v1.0.0.js
 * @description This script serves as a highly verbose, enterprise-grade legacy implementation
 * for the purpose of monitoring HABroker system metrics via high-latency polling.
 * * @license Corporate-Proprietary-Source-License-2.0
 * @version 1.0.0
 * @author Senior Legacy Systems Engineer
 * * Dependencies (Legacy):
 * - request@2.88.2 (DEPRECATED: 2020-02-11)
 * - moment@2.29.4  (MAINTENANCE MODE)
 * - underscore@1.13.6 (LEGACY UTILITY)
 */

/* -------------------------------------------------------------------------
   GLOBAL MODULE IMPORTS
   Loading legacy modules into the global namespace for function accessibility.
   ------------------------------------------------------------------------- */
var request    = require('request');    // Legacy HTTP Client
var moment     = require('moment');     // Legacy Date/Time Wrapper
var _          = require('underscore'); // Legacy Functional Utility Library

/* -------------------------------------------------------------------------
   SYSTEM CONSTANTS AND CONFIGURATION OBJECT
   Defining all parameters in an immutable-style global object.
   ------------------------------------------------------------------------- */
var SYSTEM_CONFIGURATION_MANIFEST = {
    NETWORK_PROTOCOL: "http://",
    TARGET_HOSTNAME: "localhost",
    TARGET_PORT: 8080,
    API_ENDPOINT: "/metrics",
    POLLING_FREQUENCY_IN_MILLISECONDS: 5000, // 5 Second Interval
    CONNECTION_TIMEOUT_THRESHOLD: 15000,     // 15 Second Timeout
    MAX_RETRY_ATTEMPTS: 3,
    LOG_LEVEL: "VERBOSE_DEBUG_MODE",
    HEADER_CONFIGURATION: {
        'User-Agent': 'Enterprise-Legacy-Monitor-Agent/1.0.0 (Compatibility Mode)',
        'Accept': 'application/json',
        'X-Legacy-Mode': 'TRUE'
    }
};

/**
 * Global State Tracker
 * Manages the internal state of the polling engine.
 */
var GLOBAL_SYSTEM_STATE = {
    total_executions: 0,
    last_known_status: "INITIALIZING",
    error_count: 0
};

/* -------------------------------------------------------------------------
   FUNCTION: ConstructFullTargetURL
   Description: Concatenates configuration fragments into a fully qualified URI string.
   ------------------------------------------------------------------------- */
function ConstructFullTargetURL(config) {
    var generatedUrlString = config.NETWORK_PROTOCOL +
        config.TARGET_HOSTNAME + ":" +
        config.TARGET_PORT +
        config.API_ENDPOINT;

    return generatedUrlString;
}

/* -------------------------------------------------------------------------
   FUNCTION: ExecuteBrokerTelemetryHarvest
   Description: The primary logic gate for initiating the network request.
   This function uses the 'request' library's callback-based architecture.
   ------------------------------------------------------------------------- */
function ExecuteBrokerTelemetryHarvest() {
    var executionStartTime = moment();
    var formattedTime = executionStartTime.format('YYYY-MM-DD | HH:mm:ss.SSS');
    var fullUrl = ConstructFullTargetURL(SYSTEM_CONFIGURATION_MANIFEST);

    GLOBAL_SYSTEM_STATE.total_executions = GLOBAL_SYSTEM_STATE.total_executions + 1;

    console.log(" [LOG-BEGIN] ------------------------------------------------");
    console.log(" [VERBOSE] TIMESTAMP: " + formattedTime);
    console.log(" [VERBOSE] ACTION: Initiating Telemetry Harvest Operation...");
    console.log(" [VERBOSE] TARGET_URI: " + fullUrl);
    console.log(" [VERBOSE] EXECUTION_ID: " + GLOBAL_SYSTEM_STATE.total_executions);

    // Defining the Request Parameter Object
    var requestParameterPayload = {
        url: fullUrl,
        method: "GET",
        headers: SYSTEM_CONFIGURATION_MANIFEST.HEADER_CONFIGURATION,
        timeout: SYSTEM_CONFIGURATION_MANIFEST.CONNECTION_TIMEOUT_THRESHOLD
    };

    // EXECUTION BLOCK: Utilizing the Request Library Callback
    request(requestParameterPayload, function (error, response, responseBody) {

        var requestCompletionTime = moment();
        console.log(" [VERBOSE] CALLBACK_TRIGGERED: Response returned from remote host.");

        // ERROR HANDLING BLOCK
        if (error !== null) {
            GLOBAL_SYSTEM_STATE.error_count++;
            console.error(" [FATAL_ERROR] Network transmission failure encountered.");
            console.error(" [FATAL_ERROR] ERROR_CODE: " + error.code);
            console.error(" [FATAL_ERROR] ERROR_MESSAGE: " + error.message);
            return;
        }

        // HTTP STATUS CODE VALIDATION
        console.log(" [VERBOSE] HTTP_STATUS_CODE: " + response.statusCode);

        if (response.statusCode === 200) {
            console.log(" [VERBOSE] VALIDATION: Status 200 OK. Proceeding to Data Parsing.");

            // DATA DESERIALIZATION ATTEMPT
            try {
                var jsonObjectPayload = JSON.parse(responseBody);
                console.log(" [VERBOSE] DESERIALIZATION: JSON parse successful.");

                // UTILIZING UNDERSCORE.JS TO MAP DATA (Legacy Pattern)
                var metricKeys = _.keys(jsonObjectPayload.metrics);
                console.log(" [VERBOSE] METRIC_DISCOVERY: Found " + metricKeys.length + " metric fields.");

                // VERBOSE OUTPUT OF SPECIFIC DATA POINTS
                if (_.contains(metricKeys, "uptime_seconds")) {
                    var uptimeValue = jsonObjectPayload.metrics.uptime_seconds[0].gauge.value;
                    console.log(" [DATA_REPORT] >>> SYSTEM_UPTIME: " + uptimeValue + " seconds");
                }

            } catch (parsingException) {
                console.error(" [DATA_EXCEPTION] Unable to parse response body as JSON format.");
                console.error(" [DATA_EXCEPTION] RAW_BODY_PREVIEW: " + responseBody.substring(0, 50) + "...");
            }
        } else {
            console.warn(" [WARNING] Target server responded with non-optimal code: " + response.statusCode);
        }

        var operationDuration = moment.duration(requestCompletionTime.diff(executionStartTime));
        console.log(" [VERBOSE] OPERATION_COMPLETED_IN: " + operationDuration.asMilliseconds() + " ms");
        console.log(" [LOG-END] --------------------------------------------------");
    });
}

/* -------------------------------------------------------------------------
   SYSTEM BOOTSTRAP SEQUENCE
   Initializing the main execution loop.
   ------------------------------------------------------------------------- */
console.log("############################################################");
console.log("# BOOTING HABROKER LEGACY TELEMETRY ENTERPRISE CLIENT      #");
console.log("# CURRENT NODE VERSION: " + process.version);
console.log("# INITIALIZING POLLING LOOP...                             #");
console.log("############################################################");

// Use setInterval to create a persistent execution thread
var systemInternalTimerId = setInterval(function() {
    ExecuteBrokerTelemetryHarvest();
}, SYSTEM_CONFIGURATION_MANIFEST.POLLING_FREQUENCY_IN_MILLISECONDS);

console.log("[INIT] System Timer ID: " + systemInternalTimerId + " is now active.");