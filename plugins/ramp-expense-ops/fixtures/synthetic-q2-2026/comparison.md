# Version Comparison

Synthetic comparison data for Ramp Expense Ops Plugin.

| Metric | v0.1.0 | v0.2.0 | Delta |
| --- | ---: | ---: | ---: |
| Installs | 148 | 184 | +36 |
| Invocations | 642 | 811 | +169 |
| Completion rate | 86% | 93% | +7 pts |
| Error rate | 3.1% | 1.4% | -1.7 pts |
| p95 duration | 18320 ms | 12480 ms | -5840 ms |
| Review exceptions | 6 | 4 | -2 |
| Auto-decision rate | 42% | 68% | +26 pts |

## Product readout

- v0.1.0 is the baseline demo: good install and usage signal, but more manual review.
- v0.2.0 adds richer fixture coverage and better component telemetry, so PMs can compare adoption, completion quality, and operational outcomes.
- The latest root CSV files mirror v0.2.0; use the subdirectories when a strict version comparison is needed.
