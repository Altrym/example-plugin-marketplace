# Version Comparison

Synthetic comparison data for Mercury Treasury Plugin.

| Metric | v0.1.0 | v0.2.0 | Delta |
| --- | ---: | ---: | ---: |
| Installs | 103 | 137 | +34 |
| Invocations | 447 | 604 | +157 |
| Completion rate | 91% | 96% | +5 pts |
| Error rate | 1.8% | 0.9% | -0.9 pts |
| p95 duration | 14210 ms | 10140 ms | -4070 ms |
| Review exceptions | 4 | 3 | -1 |
| Auto-decision rate | 51% | 74% | +23 pts |

## Product readout

- v0.1.0 is the baseline demo: good install and usage signal, but more manual review.
- v0.2.0 adds richer fixture coverage and better component telemetry, so PMs can compare adoption, completion quality, and operational outcomes.
- The latest root CSV files mirror v0.2.0; use the subdirectories when a strict version comparison is needed.
