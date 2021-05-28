#include <node_api.h>
#include "qrcodegen.h"

#include <stdlib.h>
//#include <stdio.h>

napi_value createFalse(napi_env env)
{
        napi_value result;
        napi_get_boolean(env, false, &result);
        return result;
}

napi_value encode(napi_env env, napi_callback_info info)
{
        size_t argsLength = 2;
        napi_value args[2];
        napi_get_cb_info(env, info, &argsLength, args, 0, 0);

        if (argsLength < 1)
        {
                return createFalse(env);
        }

        int32_t errorCorrection;
        if (argsLength == 1)
        {
                errorCorrection = 0;
        }
        else
        {
                napi_get_value_int32(env, args[1], &errorCorrection);
        }

        enum qrcodegen_Ecc ecc;
        switch (errorCorrection)
        {
        case 1:
                ecc = qrcodegen_Ecc_MEDIUM;
                break;
        case 2:
                ecc = qrcodegen_Ecc_QUARTILE;
                break;
        case 3:
                ecc = qrcodegen_Ecc_HIGH;
                break;
        default:
                ecc = qrcodegen_Ecc_LOW;
                break;
        }

        napi_valuetype type;
        napi_typeof(env, args[0], &type);

        uint8_t qr[qrcodegen_BUFFER_LEN_MAX];
        uint8_t tempBuffer[qrcodegen_BUFFER_LEN_MAX];
        int32_t size;
        if (type == napi_string)
        {
                size_t stringDataLength;
                napi_get_value_string_utf8(env, args[0], NULL, 0, &stringDataLength);
                ++stringDataLength;
                char stringData[stringDataLength];
                napi_get_value_string_utf8(env, args[0], stringData, stringDataLength, &stringDataLength);

                bool ok = qrcodegen_encodeText(stringData, tempBuffer, qr, ecc, qrcodegen_VERSION_MIN, qrcodegen_VERSION_MAX, qrcodegen_Mask_AUTO, true);
                if (!ok)
                {
                        return createFalse(env);
                }
        }
        else
        {
                bool isBuffer;
                napi_is_buffer(env, args[0], &isBuffer);
                if (!isBuffer)
                {
                        return createFalse(env);
                }
                uint8_t *binaryData;
                size_t binaryDataLength;
                napi_get_buffer_info(env, args[0], (void **)(&binaryData), &binaryDataLength);

                bool ok = qrcodegen_encodeBinary(tempBuffer, binaryDataLength, qr, ecc, qrcodegen_VERSION_MIN, qrcodegen_VERSION_MAX, qrcodegen_Mask_AUTO, true);
                if (!ok)
                {
                        return createFalse(env);
                }
        }
        size = qrcodegen_getSize(qr);
        napi_value result;
        napi_create_array_with_length(env, size, &result);
        for (int32_t y = 0; y < size; ++y)
        {
                uint8_t *bufferData;
                napi_value row;
                napi_create_buffer(env, size, (void **)&bufferData, &row);
                for (int32_t x = 0; x < size; ++x)
                {
                        bufferData[x] = qrcodegen_getModule(qr, x, y);
                }
                napi_set_element(env, result, y, row);
        }
        return result;
}

napi_value Init(napi_env env, napi_value exports)
{
        napi_property_descriptor allDesc[] = {
            {"encode", 0, encode, 0, 0, 0, napi_default, 0}};
        napi_define_properties(env, exports, 1, allDesc);
        return exports;
}

NAPI_MODULE(qr_code, Init);
