#!/usr/bin/env bash
# Recreates progress.txt and run-log.txt, the real terminal output on the WESTPA card.
#
# Runs WESTPA's ODLD toy system (from WESTPA's test references) for 1000 iterations and grabs one
# live frame of the w_progress dashboard from Edison's pull request, westpa/westpa#595, plus the
# w_run lines printed just before it.
#
# Needs a Python environment with that branch installed, for example:
#   git clone https://github.com/westpa/westpa && cd westpa
#   git fetch origin pull/595/head:w-progress && git checkout w-progress
#   echo 'cython<3.1' > /tmp/pins.txt && PIP_CONSTRAINT=/tmp/pins.txt pip install .
#
# Usage: run-odld.sh <westpa checkout> <empty simulation directory>
set -euo pipefail

westpa_src=$(cd "$1" && pwd)
here=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$2" && cd "$2"

cp "$westpa_src/tests/refs/odld/west.cfg" "$westpa_src/tests/refs/odld/odld_system.py" .
sed -i 's/max_total_iterations: 100/max_total_iterations: 1000/' west.cfg
export WEST_SIM_ROOT="$PWD"

w_init --bstate 'initial,1.0' --segs-per-state 1 > init.log 2>&1
w_run > run.log 2>&1 &
run_pid=$!

# About 40 percent of the way through on a laptop class CPU.
sleep 22
timeout 6 w_progress --refresh 1 > frames.txt 2>&1 || true
wait "$run_pid"

# Off a terminal, w_progress appends frames instead of clearing the screen. Keep the last one.
awk 'BEGIN { RS = "WESTPA Progress\n" } END { printf "WESTPA Progress\n%s", $0 }' frames.txt > "$here/progress.txt"

# The w_run log up to the end of the last completed iteration shown in that frame.
done_iter=$(awk '/^Latest completed:/ { print $3 }' "$here/progress.txt")
end=$(awk -v it="$done_iter" '/^Beginning iteration / { cur = $3 } cur == it && /^Iteration wallclock/ { print NR; exit }' run.log)
sed -n "$((end - 40)),${end}p" run.log > "$here/run-log.txt"
