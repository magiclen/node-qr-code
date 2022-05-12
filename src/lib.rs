use std::str::from_utf8;

use neon::prelude::*;
use neon::types::buffer::TypedArray;

const DEFAULT_ECC: qrcode_generator::QrCodeEcc = qrcode_generator::QrCodeEcc::Low;

fn qr_code_to_js_buffer<'a>(
    cx: &mut FunctionContext<'a>,
    qr_code: Vec<Vec<bool>>,
) -> JsResult<'a, JsArray> {
    let size = qr_code.len();

    let array = JsArray::new(cx, size as u32);

    for (i, qr_code_row) in qr_code.into_iter().enumerate() {
        let mut buffer = JsBuffer::new(cx, size)?;

        let data = buffer.as_mut_slice(cx);

        for (i, v) in qr_code_row.iter().copied().enumerate() {
            if v {
                data[i] = 1;
            }
        }

        array.set(cx, i as u32, buffer)?;
    }

    Ok(array)
}

fn encode(mut cx: FunctionContext) -> JsResult<JsArray> {
    match cx.argument_opt(0) {
        Some(arg1) => {
            let ecc = match cx.argument_opt(1) {
                Some(arg) => {
                    if let Ok(arg) = arg.downcast::<JsNumber, _>(&mut cx) {
                        match arg.value(&mut cx) as i64 {
                            1 => qrcode_generator::QrCodeEcc::Medium,
                            2 => qrcode_generator::QrCodeEcc::Quartile,
                            3 => qrcode_generator::QrCodeEcc::High,
                            _ => DEFAULT_ECC,
                        }
                    } else {
                        DEFAULT_ECC
                    }
                }
                None => DEFAULT_ECC,
            };

            if let Ok(arg) = arg1.downcast::<JsBuffer, _>(&mut cx) {
                let qr_code = {
                    let data = arg.as_slice(&cx);

                    match from_utf8(data) {
                        Ok(s) => {
                            match qrcode_segments_optimizer::make_segments_from_str(s, ecc) {
                                Ok(segments) => {
                                    qrcode_generator::to_matrix_from_segments(&segments, ecc)
                                }
                                Err(err) => Err(err),
                            }
                        }
                        Err(_) => qrcode_generator::to_matrix(data, ecc),
                    }
                };

                match qr_code {
                    Ok(qr_code) => qr_code_to_js_buffer(&mut cx, qr_code),
                    Err(err) => cx.throw_error(err.to_string()),
                }
            } else {
                let arg = arg1.downcast_or_throw::<JsString, _>(&mut cx)?;

                let arg = arg.value(&mut cx);

                match qrcode_segments_optimizer::make_segments_from_str(arg, ecc) {
                    Ok(segments) => {
                        match qrcode_generator::to_matrix_from_segments(&segments, ecc) {
                            Ok(qr_code) => qr_code_to_js_buffer(&mut cx, qr_code),
                            Err(err) => cx.throw_error(err.to_string()),
                        }
                    }
                    Err(err) => cx.throw_error(err.to_string()),
                }
            }
        }
        None => cx.throw_error("need an argument"),
    }
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("encode", encode)?;

    Ok(())
}
