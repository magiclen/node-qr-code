use napi::{
    Either, Error, Result, Status,
    bindgen_prelude::{Buffer, Uint8ArraySlice},
};
use napi_derive::napi;
use qrcode_generator::{
    EncodeError, Renderer, Symbol, SymbolErrorCorrection, SymbolVersion, micro, qr, rmqr,
};

// These values must match the error correction objects in `src/index.ts`.
const LOW: u32 = 0;
const MEDIUM: u32 = 1;
const QUARTILE: u32 = 2;
const HIGH: u32 = 3;
const DETECTION_ONLY: u32 = 4;

/// An encoded QR Code, Micro QR Code or rMQR symbol.
#[napi]
pub struct NativeSymbol {
    inner: Symbol,
}

#[napi]
impl NativeSymbol {
    /// The symbol width in modules.
    #[napi(getter)]
    pub fn width(&self) -> u32 {
        self.inner.width() as u32
    }

    /// The symbol height in modules.
    #[napi(getter)]
    pub fn height(&self) -> u32 {
        self.inner.height() as u32
    }

    /// The version number for QR Code, or the version name such as `M2` or `R7x43` for the other families.
    #[napi(getter)]
    pub fn version(&self) -> Result<Either<u32, String>> {
        match self.inner.version() {
            SymbolVersion::Qr(version) => Ok(Either::A(u32::from(version.value()))),
            SymbolVersion::Micro(version) => {
                let name = match version {
                    micro::Version::M1 => "M1",
                    micro::Version::M2 => "M2",
                    micro::Version::M3 => "M3",
                    micro::Version::M4 => "M4",
                };

                Ok(Either::B(name.to_string()))
            },
            SymbolVersion::Rmqr(version) => {
                Ok(Either::B(format!("R{}x{}", version.height(), version.width())))
            },
            _ => Err(Error::new(Status::GenericFailure, "unsupported symbol version")),
        }
    }

    /// The error correction level written to the symbol, which can be higher than the requested one.
    #[napi(getter, ts_return_type = "0 | 1 | 2 | 3 | 4")]
    pub fn error_correction(&self) -> Result<u32> {
        match self.inner.error_correction() {
            SymbolErrorCorrection::DetectionOnly => Ok(DETECTION_ONLY),
            SymbolErrorCorrection::Low => Ok(LOW),
            SymbolErrorCorrection::Medium => Ok(MEDIUM),
            SymbolErrorCorrection::Quartile => Ok(QUARTILE),
            SymbolErrorCorrection::High => Ok(HIGH),
            _ => Err(Error::new(Status::GenericFailure, "unsupported error correction level")),
        }
    }

    /// Returns the modules in row-major order, where `1` is dark and `0` is light.
    #[napi]
    pub fn modules(&self) -> Buffer {
        let modules: Vec<u8> =
            self.inner.modules().iter().map(|&module| u8::from(module)).collect();

        modules.into()
    }

    /// Renders the symbol as an SVG image with exact pixel dimensions.
    #[napi]
    pub fn to_svg(
        &self,
        width: u32,
        height: u32,
        quiet_zone: Option<u32>,
        xml_declaration: bool,
        description: Option<String>,
    ) -> Result<String> {
        let mut renderer =
            Renderer::new_with_dimensions(&self.inner, width as usize, height as usize)
                .svg_xml_declaration(xml_declaration);

        if let Some(quiet_zone) = quiet_zone {
            renderer = renderer.quiet_zone(quiet_zone as usize);
        }

        renderer.to_svg_string(description).map_err(|error| {
            Error::new(Status::InvalidArg, format!("failed to render the SVG image: {error}"))
        })
    }
}

/// Encodes text into a QR Code with automatically optimized segments.
#[napi]
pub fn encode_qr_text(text: String, error_correction: u32) -> Result<NativeSymbol> {
    qr_encoder(error_correction)?.encode_text(text).map(into_native_symbol).map_err(into_napi_error)
}

/// Encodes bytes into a QR Code without changing them.
#[napi]
pub fn encode_qr_bytes(data: Uint8ArraySlice<'_>, error_correction: u32) -> Result<NativeSymbol> {
    qr_encoder(error_correction)?
        .encode_bytes(data.as_ref())
        .map(into_native_symbol)
        .map_err(into_napi_error)
}

/// Encodes ISO-8859-1 text into a Micro QR Code with automatically optimized segments.
#[napi]
pub fn encode_micro_qr_text(text: String, error_correction: u32) -> Result<NativeSymbol> {
    micro_encoder(error_correction)?
        .encode_text(text)
        .map(into_native_symbol)
        .map_err(into_napi_error)
}

/// Encodes bytes into a Micro QR Code without changing them.
#[napi]
pub fn encode_micro_qr_bytes(
    data: Uint8ArraySlice<'_>,
    error_correction: u32,
) -> Result<NativeSymbol> {
    micro_encoder(error_correction)?
        .encode_bytes(data.as_ref())
        .map(into_native_symbol)
        .map_err(into_napi_error)
}

/// Encodes text into an rMQR symbol with automatically optimized segments.
#[napi]
pub fn encode_rmqr_text(text: String, error_correction: u32) -> Result<NativeSymbol> {
    rmqr_encoder(error_correction)?
        .encode_text(text)
        .map(into_native_symbol)
        .map_err(into_napi_error)
}

/// Encodes bytes into an rMQR symbol without changing them.
#[napi]
pub fn encode_rmqr_bytes(data: Uint8ArraySlice<'_>, error_correction: u32) -> Result<NativeSymbol> {
    rmqr_encoder(error_correction)?
        .encode_bytes(data.as_ref())
        .map(into_native_symbol)
        .map_err(into_napi_error)
}

#[inline]
fn qr_encoder(error_correction: u32) -> Result<qr::Encoder> {
    let error_correction = match error_correction {
        LOW => qr::ErrorCorrection::Low,
        MEDIUM => qr::ErrorCorrection::Medium,
        QUARTILE => qr::ErrorCorrection::Quartile,
        HIGH => qr::ErrorCorrection::High,
        _ => return Err(unsupported_error_correction("QR Code")),
    };

    Ok(qr::Encoder::new(error_correction))
}

#[inline]
fn micro_encoder(error_correction: u32) -> Result<micro::Encoder> {
    let error_correction = match error_correction {
        DETECTION_ONLY => micro::ErrorCorrection::DetectionOnly,
        LOW => micro::ErrorCorrection::Low,
        MEDIUM => micro::ErrorCorrection::Medium,
        QUARTILE => micro::ErrorCorrection::Quartile,
        _ => return Err(unsupported_error_correction("Micro QR Code")),
    };

    Ok(micro::Encoder::new(error_correction))
}

#[inline]
fn rmqr_encoder(error_correction: u32) -> Result<rmqr::Encoder> {
    let error_correction = match error_correction {
        MEDIUM => rmqr::ErrorCorrection::Medium,
        HIGH => rmqr::ErrorCorrection::High,
        _ => return Err(unsupported_error_correction("rMQR")),
    };

    Ok(rmqr::Encoder::new(error_correction))
}

#[inline]
fn unsupported_error_correction(family: &str) -> Error {
    Error::new(
        Status::InvalidArg,
        format!("The error correction level is not supported by {family}"),
    )
}

#[inline]
fn into_native_symbol(symbol: Symbol) -> NativeSymbol {
    NativeSymbol {
        inner: symbol
    }
}

#[inline]
fn into_napi_error(error: EncodeError) -> Error {
    Error::new(Status::InvalidArg, format!("failed to encode the data: {error}"))
}
