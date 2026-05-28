# Version Comparison

Synthetic comparison data for Brex Spend Controls Plugin.

| Metric | v0.1.0 | v0.2.0 | Delta |
| --- | ---: | ---: | ---: |
| Installs | 121 | 159 | +38 |
| Invocations | 513 | 688 | +175 |
| Completion rate | 89% | 94% | +5 pts |
| Error rate | 2.4% | 1.2% | -1.2 pts |
| p95 duration | 16940 ms | 11870 ms | -5070 ms |
| Review exceptions | 5 | 3 | -2 |
| Auto-decision rate | 47% | 71% | +24 pts |

## Product readout

- v0.1.0 is the baseline demo: good install and usage signal, but more manual review.
- v0.2.0 adds richer fixture coverage and better component telemetry, so PMs can compare adoption, completion quality, and operational outcomes.
- The latest root CSV files mirror v0.2.0; use the subdirectories when a strict version comparison is needed.
