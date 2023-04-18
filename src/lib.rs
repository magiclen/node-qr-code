use std::str::from_utf8;

use napi::bindgen_prelude::*;
use napi_derive::napi;
use qrcode_generator::QrCodeEcc;

const DEFAULT_ECC: QrCodeEcc = QrCodeEcc::Low;

#[allow(clippy::uninit_vec)]
fn qr_code_to_js_buffer(qr_code: Vec<Vec<bool>>) -> Result<Vec<Buffer>> {
    let size = qr_code.len();

    let mut array = Vec::with_capacity(size);

    let remaining = array.spare_capacity_mut();

    for (i, qr_code_row) in qr_code.into_iter().enumerate() {
        let mut buffer = vec![0u8; size];

        for (i, v) in qr_code_row.iter().copied().enumerate() {
            if v {
                buffer[i] = 1;
            }
        }

        remaining[i].write(Buffer::from(buffer));
    }

    unsafe {
        array.set_len(size);
    }

    Ok(array)
}

#[inline]
fn get_ecc(ecc: Option<u8>) -> QrCodeEcc {
    match ecc {
        Some(n) => match n {
            1 => QrCodeEcc::Medium,
            2 => QrCodeEcc::Quartile,
            3 => QrCodeEcc::High,
            _ => DEFAULT_ECC,
        },
        None => DEFAULT_ECC,
    }
}

#[napi(js_name = "encodeBuffer")]
pub fn encode_buffer(buffer: Buffer, ecc: Option<u8>) -> Result<Vec<Buffer>> {
    let ecc = get_ecc(ecc);

    let qr_code = {
        let data = buffer.as_ref();

        match from_utf8(data) {
            Ok(s) => {
                let segments = qrcode_segments_optimizer::make_segments_from_str(s, ecc)
                    .map_err(|err| Error::from_reason(err.to_string()))?;

                qrcode_generator::to_matrix_from_segments(&segments, ecc)
                    .map_err(|err| Error::from_reason(err.to_string()))?
            },
            Err(_) => qrcode_generator::to_matrix(data, ecc)
                .map_err(|err| Error::from_reason(err.to_string()))?,
        }
    };

    qr_code_to_js_buffer(qr_code)
}

#[napi(js_name = "encodeString")]
pub fn encode_string(s: String, ecc: Option<u8>) -> Result<Vec<Buffer>> {
    let ecc = get_ecc(ecc);

    let segments = qrcode_segments_optimizer::make_segments_from_str(s, ecc)
        .map_err(|err| Error::from_reason(err.to_string()))?;

    let qr_code = qrcode_generator::to_matrix_from_segments(&segments, ecc)
        .map_err(|err| Error::from_reason(err.to_string()))?;

    qr_code_to_js_buffer(qr_code)
}
