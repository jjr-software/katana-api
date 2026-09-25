import unittest
from copy import deepcopy

from app.katana.client import AmpClient
from app.katana.protocol import ADDR_PATCH_DELAY_1, ADDR_PATCH_DELAY_4, addr_add, addr_add_7bit_data
from app.patch_objects import merge_patch_object_into_full_patch


class DelayTimeWriteTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = AmpClient(midi_port="auto", timeout_seconds=1, rq1_timeout_seconds=1)
        delay1 = [0, 0, 2, 3, 7, 22, 10, 50, 100, 50, 40, 55, 1, 0, 0, 0, 0]
        delay2 = [0, 0, 1, 9, 0, 22, 10, 50, 100, 50, 40, 55, 1, 0, 0, 0, 0]
        self.previous = {
            "colors": {name: {"index": 0} for name in ("booster", "mod", "fx", "delay", "reverb")},
            "stages": {
                **{name: {"on": False} for name in ("booster", "mod", "fx", "reverb")},
                "delay": {
                    "on": True, "delay2_on": False, "raw": delay1, "delay2_raw": delay2,
                    "time_raw": delay1[1:5],
                    "variants_raw": [delay1[:], delay1[:], delay1[:]],
                    "variants2_raw": [delay2[:], delay2[:], delay2[:]],
                },
            },
        }

    def test_delay1_time_writes_all_four_bytes_after_sparse_merge(self) -> None:
        edited = deepcopy(self.previous["stages"]["delay"])
        edited["raw"][1:5] = [0, 0, 0, 1]
        edited["time_raw"] = [0, 0, 0, 1]
        current = merge_patch_object_into_full_patch(self.previous, {"delay": edited})

        writes = self.client._build_selected_patch_block_writes("delay", self.previous, current)

        self.assertEqual(writes, [(addr_add_7bit_data(ADDR_PATCH_DELAY_1, 1), [0, 0, 0, 1])])
        self.assertEqual(current["stages"]["delay"]["delay2_raw"], self.previous["stages"]["delay"]["delay2_raw"])

    def test_delay2_time_uses_selected_colour_and_keeps_delay1(self) -> None:
        previous = deepcopy(self.previous)
        previous["colors"]["delay"]["index"] = 1
        edited = deepcopy(previous["stages"]["delay"])
        edited["delay2_raw"][1:5] = [0, 0, 0, 1]
        current = merge_patch_object_into_full_patch(previous, {"delay": {**edited, "color_index": 1}})

        writes = self.client._build_selected_patch_block_writes("delay", previous, current)

        delay2_red = addr_add(ADDR_PATCH_DELAY_4, 0x200)
        self.assertEqual(writes, [(addr_add_7bit_data(delay2_red, 1), [0, 0, 0, 1])])
        self.assertEqual(current["stages"]["delay"]["raw"], previous["stages"]["delay"]["raw"])


if __name__ == "__main__":
    unittest.main()
