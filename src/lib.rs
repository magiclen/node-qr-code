use napi::{
    Error, Result, Status,
    bindgen_prelude::{Buffer, Uint8ArraySlice},
};
use napi_derive::napi;
use qrcode_generator::{EncodeError, Symbol, qr};

/// An encoded symbol whose modules are stored row by row in one buffer.
#[napi(object)]
pub struct NativeSymbol {
    /// The number of modules per side.
    pub size:    u32,
    /// The modules in row-major order, where `1` is dark and `0` is light.
    pub modules: Buffer,
}

/// Encodes text into a QR Code with automatically optimized segments.
#[napi]
pub fn encode_text(text: String, error_correction: u32) -> Result<NativeSymbol> {
    let symbol = qr::Encoder::new(to_error_correction(error_correction)?)
        .encode_text(text)
        .map_err(into_napi_error)?;

    Ok(to_native_symbol(&symbol))
}

/// Encodes bytes into a QR Code without changing them.
#[napi]
pub fn encode_bytes(data: Uint8ArraySlice<'_>, error_correction: u32) -> Result<NativeSymbol> {
    let symbol = qr::Encoder::new(to_error_correction(error_correction)?)
        .encode_bytes(data.as_ref())
        .map_err(into_napi_error)?;

    Ok(to_native_symbol(&symbol))
}

#[inline]
fn to_error_correction(error_correction: u32) -> Result<qr::ErrorCorrection> {
    match error_correction {
        0 => Ok(qr::ErrorCorrection::Low),
        1 => Ok(qr::ErrorCorrection::Medium),
        2 => Ok(qr::ErrorCorrection::Quartile),
        3 => Ok(qr::ErrorCorrection::High),
        _ => Err(Error::new(Status::InvalidArg, "The error correction level must be 0, 1, 2 or 3")),
    }
}

#[inline]
fn to_native_symbol(symbol: &Symbol) -> NativeSymbol {
    let modules: Vec<u8> = symbol.modules().iter().map(|&module| u8::from(module)).collect();

    NativeSymbol {
        size: symbol.size() as u32, modules: modules.into()
    }
}

#[inline]
fn into_napi_error(error: EncodeError) -> Error {
    Error::new(Status::InvalidArg, format!("failed to encode the data: {error}"))
}
