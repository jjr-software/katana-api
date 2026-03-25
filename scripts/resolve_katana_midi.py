#!/usr/bin/env python3
"""Resolve Katana ALSA card index/port from host /proc/asound/cards.

Usage:
  python3 scripts/resolve_katana_midi.py --shell
  python3 scripts/resolve_katana_midi.py --env-file .env.katana
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

CARDS_PATH = Path('/proc/asound/cards')


def parse_cards(text: str) -> list[tuple[int, str]]:
    out: list[tuple[int, str]] = []
    for line in text.splitlines():
        m = re.match(r"\s*(\d+)\s+\[(.+?)\s*\]:", line)
        if not m:
            continue
        out.append((int(m.group(1)), m.group(2).strip()))
    return out


def resolve_katana_card(cards: list[tuple[int, str]]) -> int:
    for idx, short in cards:
        if 'KATANA' in short.upper():
            return idx
    raise RuntimeError('Katana card not found in /proc/asound/cards')


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--env-file', help='Write KEY=VALUE lines to this file')
    ap.add_argument('--shell', action='store_true', help='Print shell export lines')
    args = ap.parse_args()

    if not CARDS_PATH.exists():
        raise RuntimeError('/proc/asound/cards is missing on host')

    cards_text = CARDS_PATH.read_text(encoding='utf-8')
    cards = parse_cards(cards_text)
    katana_idx = resolve_katana_card(cards)

    midi_port = f'hw:{katana_idx},0,0'
    midi_devnode = f'/dev/snd/midiC{katana_idx}D0'

    if not Path(midi_devnode).exists():
        raise RuntimeError(f'Expected MIDI devnode missing: {midi_devnode}')

    lines = [
        f'KATANA_CARD_INDEX={katana_idx}',
        f'KATANA_MIDI_PORT={midi_port}',
        f'KATANA_MIDI_DEVNODE={midi_devnode}',
    ]

    if args.env_file:
        Path(args.env_file).write_text('\n'.join(lines) + '\n', encoding='utf-8')

    if args.shell:
        print('\n'.join(f'export {line}' for line in lines))
    else:
        print('\n'.join(lines))

    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        raise SystemExit(1)
