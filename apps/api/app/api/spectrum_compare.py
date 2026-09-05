from fastapi import APIRouter

from app.spectrum_compare import SpectrumMeasurementResponse, capture_spectrum_measurement

router = APIRouter(prefix="/api/v1/spectrum-compare", tags=["spectrum-compare"])


@router.post("/measure", response_model=SpectrumMeasurementResponse)
async def measure_spectrum_compare() -> SpectrumMeasurementResponse:
    return await capture_spectrum_measurement()
