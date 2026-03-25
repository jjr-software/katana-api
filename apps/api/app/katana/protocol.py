from dataclasses import dataclass

IDENTITY_REQUEST_HEX = "F0 7E 7F 06 01 F7"
EDITOR_MODE_ON = "F0 41 10 01 05 07 12 7F 00 00 01 01 7F F7"

ROLAND_ID = 0x41
MODEL_ID = (0x01, 0x05, 0x07)
CMD_RQ1 = 0x11
CMD_DT1 = 0x12

ADDR_AMP = (0x20, 0x00, 0x06, 0x00)
ADDR_BOOSTER = (0x20, 0x00, 0x0A, 0x00)
ADDR_EQ_SWITCH = (0x20, 0x00, 0x4C, 0x00)
ADDR_GE10 = (0x20, 0x00, 0x54, 0x00)
ADDR_NS = (0x20, 0x00, 0x58, 0x00)


@dataclass(frozen=True)
class BlockSpec:
    name: str
    addr: tuple[int, int, int, int]
    size: int


CURRENT_PATCH_BLOCKS = (
    BlockSpec(name="amp", addr=ADDR_AMP, size=10),
    BlockSpec(name="booster", addr=ADDR_BOOSTER, size=8),
    BlockSpec(name="ge10_raw", addr=ADDR_GE10, size=11),
    BlockSpec(name="ns", addr=ADDR_NS, size=3),
    BlockSpec(name="eq_switch", addr=ADDR_EQ_SWITCH, size=3),
)
