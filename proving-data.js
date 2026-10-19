// Original bounded missions. Reference implementations live only in developer tests.
const PROVING = [
  {
    "id": "event-ledger",
    "title": "Repair the Event Ledger",
    "category": "Coding",
    "topics": [
      "JavaScript"
    ],
    "level": 4,
    "minutes": "20–40",
    "language": "JavaScript",
    "name": "summarize",
    "requirement": "Implement summarize(rows). Each row must be a non-null object with a nonempty string id, a nonempty string user, and status exactly \"ok\" or \"fail\". Trim id and user; user names are case-sensitive. Ignore invalid rows. For duplicate trimmed IDs, keep the FIRST valid row, even if later rows disagree. Count failures by user and return an object containing only users with failures. Do not mutate the input.",
    "evidence": "A retrying collector sends duplicate events. Its current implementation double-counts retries and treats missing statuses as failures. Valid duplicates may disagree, so the first valid event is authoritative.",
    "starter": "",
    "rubric": [
      "Explain why invalid events must not consume an ID.",
      "Explain how you handle duplicate IDs and unusual user names.",
      "State the time and space complexity and one limitation of the tests."
    ],
    "cases": [
      {
        "args": [
          []
        ],
        "expected": {}
      },
      {
        "args": [
          [
            {
              "id": "a",
              "user": "ada",
              "status": "fail"
            },
            {
              "id": "a",
              "user": "ada",
              "status": "fail"
            },
            {
              "id": "b",
              "user": "ada",
              "status": "ok"
            }
          ]
        ],
        "expected": {
          "ada": 1
        }
      },
      {
        "args": [
          [
            null,
            {},
            {
              "id": "x",
              "user": " ",
              "status": "fail"
            },
            {
              "id": "x",
              "user": " ada ",
              "status": "fail"
            },
            {
              "id": " x ",
              "user": "grace",
              "status": "fail"
            }
          ]
        ],
        "expected": {
          "ada": 1
        }
      },
      {
        "args": [
          [
            {
              "id": "a",
              "user": "constructor",
              "status": "fail"
            },
            {
              "id": "b",
              "user": "__proto__",
              "status": "fail"
            },
            {
              "id": "c",
              "user": "Ada",
              "status": "fail"
            },
            {
              "id": "d",
              "user": "ada",
              "status": "fail"
            }
          ]
        ],
        "expected": {
          "constructor": 1,
          ["__proto__"]: 1,
          "Ada": 1,
          "ada": 1
        }
      },
      {
        "args": [
          [
            {
              "id": "a",
              "user": "ada",
              "status": "ok"
            },
            {
              "id": "a",
              "user": "ada",
              "status": "fail"
            },
            {
              "id": 3,
              "user": "ada",
              "status": "fail"
            },
            {
              "id": "b",
              "user": "ada",
              "status": "FAIL"
            }
          ]
        ],
        "expected": {}
      }
    ],
    "tier": "Advanced"
  },
  {
    "id": "deployment-plan",
    "title": "Diagnose the Quiet Outage",
    "category": "Deployment",
    "topics": [
      "Docker",
      "Kubernetes",
      "Bash",
      "JavaScript"
    ],
    "level": 4,
    "minutes": "25–45",
    "language": "JavaScript",
    "name": "diagnose",
    "requirement": "Implement diagnose(config) for the supplied simulation. Config always has listener (\"127.0.0.1\" or \"0.0.0.0\"), appPort, publishedPort, targetPort (integer destination ports), probeExit (integer), and reportedHealthy (boolean). Return an array of issue codes in this exact order when applicable: \"listener\" if listener is loopback; \"publish\" if publishedPort differs from appPort; \"service\" if targetPort differs from appPort; \"health\" if reportedHealthy differs from (probeExit === 0). Include all applicable issues; return [] when consistent. Do not mutate config.",
    "evidence": "Two independent paths use the same app configuration: a local Docker container and selected Kubernetes Pods. publishedPort is the CONTAINER destination of Docker -p, not its host port. targetPort is the Service destination. A fictional shell wrapper reports health after running a probe. This is a bounded diagnosis simulation, not a live cluster or a complete deployment validator.",
    "starter": "",
    "rubric": [
      "Describe the listener and destination-port fixes for the all-failing example.",
      "Write a shell check that propagates probe failure, and describe a verification step.",
      "Name a real-world failure this simulation cannot detect, such as selector or network-policy problems."
    ],
    "cases": [
      {
        "args": [
          {
            "listener": "127.0.0.1",
            "appPort": 8000,
            "publishedPort": 8080,
            "targetPort": 8080,
            "probeExit": 7,
            "reportedHealthy": true
          }
        ],
        "expected": [
          "listener",
          "publish",
          "service",
          "health"
        ]
      },
      {
        "args": [
          {
            "listener": "0.0.0.0",
            "appPort": 8000,
            "publishedPort": 8000,
            "targetPort": 8000,
            "probeExit": 0,
            "reportedHealthy": true
          }
        ],
        "expected": []
      },
      {
        "args": [
          {
            "listener": "0.0.0.0",
            "appPort": 3000,
            "publishedPort": 3000,
            "targetPort": 3000,
            "probeExit": 0,
            "reportedHealthy": false
          }
        ],
        "expected": [
          "health"
        ]
      },
      {
        "args": [
          {
            "listener": "0.0.0.0",
            "appPort": 9000,
            "publishedPort": 9000,
            "targetPort": 80,
            "probeExit": 22,
            "reportedHealthy": false
          }
        ],
        "expected": [
          "service"
        ]
      },
      {
        "args": [
          {
            "listener": "127.0.0.1",
            "appPort": 80,
            "publishedPort": 443,
            "targetPort": 80,
            "probeExit": 0,
            "reportedHealthy": true
          }
        ],
        "expected": [
          "listener",
          "publish"
        ]
      }
    ],
    "tier": "Advanced"
  },
  {
    "id": "login-window",
    "title": "Investigate the Retry Window",
    "category": "Cyber Investigation",
    "topics": [
      "Python",
      "KQL"
    ],
    "level": 5,
    "minutes": "30–60",
    "language": "Python",
    "name": "investigate",
    "requirement": "Implement investigate(events). Every event has id, user, ip (nonempty strings), minute (integer UTC minutes on a single fictional day), and result (\"Failure\" or \"Success\"). Input may be unsorted. Keep the FIRST input row for each id. For each Success, count Failure events for the SAME user AND IP whose minute is >= success.minute - 5 and strictly < success.minute. Return one dictionary per Success with at least 3 such failures: {\"id\": success.id, \"failures\": count}. Sort results by success minute, then id. Failures may contribute to multiple successes. Do not mutate input.",
    "evidence": "All records are fictional. Correlation flags a sequence for investigation; it does not establish compromise. Your debrief must propose an equivalent KQL investigation approach and identify missing evidence. KQL prose is self-reviewed, not executed.",
    "starter": "",
    "rubric": [
      "Explain deduplication, grouping, window boundaries, and result ordering.",
      "Describe a KQL approach using failures and successes joined by user/IP, followed by time filtering and aggregation.",
      "Distinguish suspicious correlation from proof; identify authentication/session evidence to request.",
      "Analyze the time and space complexity of your approach and discuss scaling limits."
    ],
    "cases": [
      {
        "args": [
          []
        ],
        "expected": []
      },
      {
        "args": [
          [
            {
              "id": "s",
              "minute": 10,
              "result": "Success",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "f1",
              "minute": 5,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "f2",
              "minute": 7,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "f3",
              "minute": 9,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            }
          ]
        ],
        "expected": [
          {
            "id": "s",
            "failures": 3
          }
        ]
      },
      {
        "args": [
          [
            {
              "id": "f1",
              "minute": 4,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "f2",
              "minute": 5,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "f3",
              "minute": 9,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "f4",
              "minute": 10,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "s",
              "minute": 10,
              "result": "Success",
              "user": "ada",
              "ip": "198.51.100.7"
            }
          ]
        ],
        "expected": []
      },
      {
        "args": [
          [
            {
              "id": "f1",
              "minute": 5,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "f1",
              "minute": 6,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "f2",
              "minute": 7,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "other",
              "minute": 8,
              "result": "Failure",
              "user": "grace",
              "ip": "198.51.100.7"
            },
            {
              "id": "ip",
              "minute": 8,
              "result": "Failure",
              "user": "ada",
              "ip": "203.0.113.1"
            },
            {
              "id": "s",
              "minute": 10,
              "result": "Success",
              "user": "ada",
              "ip": "198.51.100.7"
            }
          ]
        ],
        "expected": []
      },
      {
        "args": [
          [
            {
              "id": "f1",
              "minute": 5,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "f2",
              "minute": 6,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "f3",
              "minute": 7,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "z",
              "minute": 10,
              "result": "Success",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "a",
              "minute": 10,
              "result": "Success",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "later",
              "minute": 11,
              "result": "Success",
              "user": "ada",
              "ip": "198.51.100.7"
            }
          ]
        ],
        "expected": [
          {
            "id": "a",
            "failures": 3
          },
          {
            "id": "z",
            "failures": 3
          }
        ]
      },
      {
        "args": [
          [
            {
              "id": "f1",
              "minute": 5,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "f2",
              "minute": 6,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "f3",
              "minute": 7,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "s",
              "minute": 8,
              "result": "Success",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "s",
              "minute": 8,
              "result": "Failure",
              "user": "ada",
              "ip": "198.51.100.7"
            },
            {
              "id": "t",
              "minute": 9,
              "result": "Success",
              "user": "ada",
              "ip": "198.51.100.7"
            }
          ]
        ],
        "expected": [
          {
            "id": "s",
            "failures": 3
          },
          {
            "id": "t",
            "failures": 3
          }
        ]
      }
    ],
    "tier": "Expert"
  },
  {
    "id": "coverage-union",
    "title": "Reconcile the Coverage Map",
    "category": "Systems & Algorithms",
    "topics": [
      "JavaScript"
    ],
    "level": 4,
    "tier": "Advanced",
    "minutes": "30–60",
    "language": "JavaScript",
    "name": "coverage",
    "requirement": "Implement coverage(intervals). Each interval is [start, end], with integer endpoints -1000000 <= start <= end <= 1000000. Intervals are half-open: start is included and end is excluded. Return the total length covered by at least one interval. Input is unsorted and may contain duplicates, touching intervals, and empty intervals. Do not mutate input.",
    "evidence": "A monitoring export reports overlapping collection periods. The incident summary must report actual coverage, not the sum of all collector durations.",
    "starter": "",
    "cases": [
      {
        "args": [
          []
        ],
        "expected": 0
      },
      {
        "args": [
          [
            [
              1,
              4
            ],
            [
              3,
              6
            ]
          ]
        ],
        "expected": 5
      },
      {
        "args": [
          [
            [
              5,
              5
            ],
            [
              -3,
              0
            ],
            [
              0,
              2
            ]
          ]
        ],
        "expected": 5
      },
      {
        "args": [
          [
            [
              0,
              10
            ],
            [
              2,
              3
            ],
            [
              0,
              10
            ]
          ]
        ],
        "expected": 10
      },
      {
        "args": [
          [
            [
              9,
              12
            ],
            [
              1,
              2
            ],
            [
              4,
              6
            ]
          ]
        ],
        "expected": 6
      },
      {
        "args": [
          [
            [
              2,
              2
            ],
            [
              0,
              0
            ]
          ]
        ],
        "expected": 0
      }
    ],
    "rubric": [
      "Explain the invariant used to avoid double-counting.",
      "Give time and space complexity, including sorting.",
      "Describe an adversarial input you checked beyond the supplied example."
    ]
  },
  {
    "id": "dependency-waves",
    "title": "Recover the Build Order",
    "category": "Systems & Algorithms",
    "topics": [
      "Python"
    ],
    "level": 5,
    "tier": "Expert",
    "minutes": "45–90",
    "language": "Python",
    "name": "waves",
    "requirement": "Implement waves(graph). graph maps task names to lists of prerequisite task names. Every prerequisite is also a key. Duplicate prerequisites count once. Return execution waves: each wave is a lexicographically sorted list of all tasks ready at the START of that wave. Return null (None in Python) if any cycle exists, even if some tasks could run. Empty input returns []. Do not mutate input.",
    "evidence": "A build system has lost its scheduler. Recover deterministic parallel execution batches from the dependency graph; dependencies completed within a wave unlock tasks only in the next wave.",
    "starter": "",
    "cases": [
      {
        "args": [
          {}
        ],
        "expected": []
      },
      {
        "args": [
          {
            "ship": [
              "test"
            ],
            "test": [
              "build"
            ],
            "build": []
          }
        ],
        "expected": [
          [
            "build"
          ],
          [
            "test"
          ],
          [
            "ship"
          ]
        ]
      },
      {
        "args": [
          {
            "z": [],
            "a": [],
            "b": [
              "a",
              "a"
            ]
          }
        ],
        "expected": [
          [
            "a",
            "z"
          ],
          [
            "b"
          ]
        ]
      },
      {
        "args": [
          {
            "a": [
              "b"
            ],
            "b": [
              "a"
            ]
          }
        ],
        "expected": null
      },
      {
        "args": [
          {
            "ok": [],
            "loop": [
              "loop"
            ]
          }
        ],
        "expected": null
      },
      {
        "args": [
          {
            "d": [
              "b",
              "c"
            ],
            "c": [
              "a"
            ],
            "b": [
              "a"
            ],
            "a": []
          }
        ],
        "expected": [
          [
            "a"
          ],
          [
            "b",
            "c"
          ],
          [
            "d"
          ]
        ]
      }
    ],
    "rubric": [
      "Explain why tasks unlocked during a wave cannot run in that wave.",
      "Explain your cycle detection, including disconnected components.",
      "State complexity and identify a more scalable representation if yours repeatedly scans pending tasks."
    ]
  },
  {
    "id": "lru-replay",
    "title": "Replay the Eviction Log",
    "category": "Systems & Algorithms",
    "topics": [
      "JavaScript"
    ],
    "level": 5,
    "tier": "Expert",
    "minutes": "45–90",
    "language": "JavaScript",
    "name": "replayCache",
    "requirement": "Implement replayCache(input), where input is {capacity, operations}. capacity is an integer from 0 through 100. Each operation is [\"put\", key, integerValue] or [\"get\", key], with string keys. Return one result for each get: the stored integer or null on a miss. Successful gets and all puts make that key most recently used. A miss does not change recency. Updating a key changes its value without consuming another slot. Evict the least recently used key only when needed. Capacity zero stores nothing. Do not mutate input.",
    "evidence": "An application loses hot entries after configuration changes. Reconstruct the observable behavior of its least-recently-used cache from an operation log.",
    "starter": "",
    "cases": [
      {
        "args": [
          {
            "capacity": 2,
            "operations": []
          }
        ],
        "expected": []
      },
      {
        "args": [
          {
            "capacity": 2,
            "operations": [
              [
                "put",
                "a",
                1
              ],
              [
                "put",
                "b",
                2
              ],
              [
                "get",
                "a"
              ],
              [
                "put",
                "c",
                3
              ],
              [
                "get",
                "b"
              ],
              [
                "get",
                "c"
              ]
            ]
          }
        ],
        "expected": [
          1,
          null,
          3
        ]
      },
      {
        "args": [
          {
            "capacity": 0,
            "operations": [
              [
                "put",
                "a",
                1
              ],
              [
                "get",
                "a"
              ]
            ]
          }
        ],
        "expected": [
          null
        ]
      },
      {
        "args": [
          {
            "capacity": 1,
            "operations": [
              [
                "put",
                "a",
                0
              ],
              [
                "get",
                "a"
              ],
              [
                "put",
                "a",
                4
              ],
              [
                "get",
                "a"
              ]
            ]
          }
        ],
        "expected": [
          0,
          4
        ]
      },
      {
        "args": [
          {
            "capacity": 2,
            "operations": [
              [
                "put",
                "a",
                1
              ],
              [
                "put",
                "b",
                2
              ],
              [
                "get",
                "x"
              ],
              [
                "put",
                "c",
                3
              ],
              [
                "get",
                "a"
              ],
              [
                "get",
                "b"
              ]
            ]
          }
        ],
        "expected": [
          null,
          null,
          2
        ]
      },
      {
        "args": [
          {
            "capacity": 2,
            "operations": [
              [
                "put",
                "__proto__",
                7
              ],
              [
                "put",
                "constructor",
                8
              ],
              [
                "put",
                "__proto__",
                9
              ],
              [
                "put",
                "c",
                3
              ],
              [
                "get",
                "constructor"
              ],
              [
                "get",
                "__proto__"
              ]
            ]
          }
        ],
        "expected": [
          null,
          9
        ]
      }
    ],
    "rubric": [
      "Explain the recency invariant and how a miss differs from a hit.",
      "Account for update, zero-capacity, and unusual-key behavior.",
      "State operation costs and distinguish an implementation guarantee from an assumption."
    ]
  },
  {
    "id": "frame-decoder",
    "title": "Reassemble the Broken Stream",
    "category": "Systems & Algorithms",
    "topics": [
      "JavaScript"
    ],
    "level": 5,
    "tier": "Hardcore",
    "minutes": "60–120",
    "language": "JavaScript",
    "name": "decodeFrames",
    "requirement": "Implement decodeFrames(chunks). chunks is an array of strings containing only printable ASCII characters. Concatenate them logically as a stream of frames formatted LENGTH:PAYLOAD,. LENGTH is one or more decimal digits with no leading zeros except \"0\", at most three digits, and a value from 0 through 255. PAYLOAD contains exactly LENGTH ASCII characters, including any colons or commas. Return {frames: [payloads], remainder: string, error: boolean}. Parse left to right. On an incomplete frame return error false and the entire unfinished frame as remainder. On the first malformed frame return error true and the entire stream from that frame onward as remainder; keep earlier complete frames. Reject an impossible length prefix immediately (including a leading zero followed by another digit, a fourth digit, or a value above 255), even if no colon has arrived. Empty input returns empty frames/remainder and false. Do not mutate input.",
    "evidence": "A forensic capture splits length-prefixed application messages at arbitrary byte boundaries. Recover complete frames and preserve the exact unconsumed evidence. This is a specified ASCII protocol, not a real network service.",
    "starter": "",
    "cases": [
      {
        "args": [
          []
        ],
        "expected": {
          "frames": [],
          "remainder": "",
          "error": false
        }
      },
      {
        "args": [
          [
            "3:a",
            "bc,0",
            ":,"
          ]
        ],
        "expected": {
          "frames": [
            "abc",
            ""
          ],
          "remainder": "",
          "error": false
        }
      },
      {
        "args": [
          [
            "1:x,4:ab"
          ]
        ],
        "expected": {
          "frames": [
            "x"
          ],
          "remainder": "4:ab",
          "error": false
        }
      },
      {
        "args": [
          [
            "2:a,:x"
          ]
        ],
        "expected": {
          "frames": [],
          "remainder": "2:a,:x",
          "error": true
        }
      },
      {
        "args": [
          [
            "01:a,"
          ]
        ],
        "expected": {
          "frames": [],
          "remainder": "01:a,",
          "error": true
        }
      },
      {
        "args": [
          [
            "1:a,256"
          ]
        ],
        "expected": {
          "frames": [
            "a"
          ],
          "remainder": "256",
          "error": true
        }
      },
      {
        "args": [
          [
            "3::,,",
            ","
          ]
        ],
        "expected": {
          "frames": [
            ":,,"
          ],
          "remainder": "",
          "error": false
        }
      },
      {
        "args": [
          [
            "0:"
          ]
        ],
        "expected": {
          "frames": [],
          "remainder": "0:",
          "error": false
        }
      },
      {
        "args": [
          [
            ":"
          ]
        ],
        "expected": {
          "frames": [],
          "remainder": ":",
          "error": true
        }
      },
      {
        "args": [
          [
            "12"
          ]
        ],
        "expected": {
          "frames": [],
          "remainder": "12",
          "error": false
        }
      }
    ],
    "rubric": [
      "State the parser invariant and distinguish incomplete input from malformed input.",
      "Explain why payload delimiters cannot be parsed as framing delimiters.",
      "Describe memory and time costs and how a persistent incremental decoder would differ."
    ]
  },
  {
    "id": "transaction-replay",
    "title": "Reconstruct the Commit Boundary",
    "category": "Systems & Algorithms",
    "topics": [
      "Python"
    ],
    "level": 5,
    "tier": "Hardcore",
    "minutes": "60–120",
    "language": "Python",
    "name": "recover",
    "requirement": "Implement recover(input), where input is {initial, log}. initial maps string keys to integer values. log contains arrays: [\"begin\", transactionId], [\"set\", transactionId, key, integerValue], [\"delete\", transactionId, key], [\"commit\", transactionId], or [\"abort\", transactionId]. IDs and keys are strings. A begin creates an active transaction only if that ID is not already active. Set/delete affect only an active transaction and are staged in operation order. Commit applies only that transaction’s staged writes/deletes to the CURRENT committed state and closes it. Abort discards its staged operations and closes it. Operations for inactive IDs are ignored, and closed IDs may be reused after another begin. Uncommitted work at end is discarded. Return the final committed dictionary; do not mutate input. This is write replay, not snapshot isolation.",
    "evidence": "The audit journal survived a crash, but the materialized state did not. Transactions interleave. Rebuild only committed effects without reverting unrelated commits.",
    "starter": "",
    "cases": [
      {
        "args": [
          {
            "initial": {},
            "log": []
          }
        ],
        "expected": {}
      },
      {
        "args": [
          {
            "initial": {
              "a": 1
            },
            "log": [
              [
                "begin",
                "t"
              ],
              [
                "set",
                "t",
                "a",
                2
              ],
              [
                "commit",
                "t"
              ]
            ]
          }
        ],
        "expected": {
          "a": 2
        }
      },
      {
        "args": [
          {
            "initial": {
              "a": 1
            },
            "log": [
              [
                "begin",
                "t"
              ],
              [
                "delete",
                "t",
                "a"
              ],
              [
                "abort",
                "t"
              ],
              [
                "set",
                "x",
                "a",
                9
              ]
            ]
          }
        ],
        "expected": {
          "a": 1
        }
      },
      {
        "args": [
          {
            "initial": {},
            "log": [
              [
                "begin",
                "a"
              ],
              [
                "begin",
                "b"
              ],
              [
                "set",
                "a",
                "x",
                1
              ],
              [
                "set",
                "b",
                "y",
                2
              ],
              [
                "commit",
                "b"
              ],
              [
                "commit",
                "a"
              ]
            ]
          }
        ],
        "expected": {
          "x": 1,
          "y": 2
        }
      },
      {
        "args": [
          {
            "initial": {},
            "log": [
              [
                "begin",
                "a"
              ],
              [
                "set",
                "a",
                "x",
                1
              ],
              [
                "begin",
                "a"
              ],
              [
                "commit",
                "a"
              ],
              [
                "begin",
                "a"
              ],
              [
                "delete",
                "a",
                "x"
              ],
              [
                "set",
                "a",
                "x",
                3
              ],
              [
                "commit",
                "a"
              ]
            ]
          }
        ],
        "expected": {
          "x": 3
        }
      },
      {
        "args": [
          {
            "initial": {
              "a": 0
            },
            "log": [
              [
                "begin",
                "a"
              ],
              [
                "set",
                "a",
                "a",
                9
              ],
              [
                "commit",
                "missing"
              ]
            ]
          }
        ],
        "expected": {
          "a": 0
        }
      },
      {
        "args": [
          {
            "initial": {},
            "log": [
              [
                "begin",
                "a"
              ],
              [
                "begin",
                "b"
              ],
              [
                "set",
                "a",
                "x",
                1
              ],
              [
                "set",
                "b",
                "x",
                2
              ],
              [
                "commit",
                "b"
              ],
              [
                "commit",
                "a"
              ]
            ]
          }
        ],
        "expected": {
          "x": 1
        }
      }
    ],
    "rubric": [
      "Explain why committing a whole transaction snapshot would lose unrelated changes.",
      "Describe active-ID reuse, duplicate begin, and commit ordering.",
      "Explain which durability and isolation guarantees this model does not provide."
    ]
  },
  {
    "id": "byte-machine",
    "title": "Reconstruct the Byte Machine",
    "category": "Systems & Algorithms",
    "topics": [
      "JavaScript"
    ],
    "level": 5,
    "tier": "Hardcore",
    "minutes": "60–120",
    "language": "JavaScript",
    "name": "execute",
    "requirement": "Implement execute(input), where input is {program, limit}. This fictional ISA has four unsigned 8-bit registers initially zero and a program counter initially zero. program is an array of instructions: [\"SET\", r, value], [\"ADD\", r, s], [\"XOR\", r, s], [\"JNZ\", r, offset], or [\"HALT\"]. Registers r/s are integers 0–3; value is any integer -1000 through 1000; offset is an integer -100 through 100; limit is an integer 0–1000. Normalize SET and ADD results modulo 256 into 0–255. ADD and XOR read both operands before writing, including when r === s. JNZ adds offset to the CURRENT counter if register r is nonzero, otherwise advances by one. Other non-HALT instructions advance by one. Return {registers, pc, steps, reason}. Before each fetch, an out-of-range counter stops with reason \"exit\"; otherwise if steps equals limit, stop with \"limit\". Every fetched instruction counts as one step. HALT stops with reason \"halt\" and leaves pc on that instruction. Do not mutate input.",
    "evidence": "A reverse-engineering exercise provides an instruction contract for a fictional byte machine. Reconstruct exact execution semantics, including wrapping, relative branches, and stopping precedence. No native assembly is executed.",
    "starter": "",
    "cases": [
      {
        "args": [
          {
            "program": [],
            "limit": 0
          }
        ],
        "expected": {
          "registers": [
            0,
            0,
            0,
            0
          ],
          "pc": 0,
          "steps": 0,
          "reason": "exit"
        }
      },
      {
        "args": [
          {
            "program": [
              [
                "HALT"
              ]
            ],
            "limit": 0
          }
        ],
        "expected": {
          "registers": [
            0,
            0,
            0,
            0
          ],
          "pc": 0,
          "steps": 0,
          "reason": "limit"
        }
      },
      {
        "args": [
          {
            "program": [
              [
                "SET",
                0,
                -1
              ],
              [
                "ADD",
                0,
                0
              ],
              [
                "HALT"
              ]
            ],
            "limit": 3
          }
        ],
        "expected": {
          "registers": [
            254,
            0,
            0,
            0
          ],
          "pc": 2,
          "steps": 3,
          "reason": "halt"
        }
      },
      {
        "args": [
          {
            "program": [
              [
                "SET",
                1,
                7
              ],
              [
                "XOR",
                1,
                1
              ]
            ],
            "limit": 2
          }
        ],
        "expected": {
          "registers": [
            0,
            0,
            0,
            0
          ],
          "pc": 2,
          "steps": 2,
          "reason": "exit"
        }
      },
      {
        "args": [
          {
            "program": [
              [
                "SET",
                0,
                1
              ],
              [
                "JNZ",
                0,
                0
              ]
            ],
            "limit": 4
          }
        ],
        "expected": {
          "registers": [
            1,
            0,
            0,
            0
          ],
          "pc": 1,
          "steps": 4,
          "reason": "limit"
        }
      },
      {
        "args": [
          {
            "program": [
              [
                "JNZ",
                0,
                -2
              ],
              [
                "HALT"
              ]
            ],
            "limit": 2
          }
        ],
        "expected": {
          "registers": [
            0,
            0,
            0,
            0
          ],
          "pc": 1,
          "steps": 2,
          "reason": "halt"
        }
      },
      {
        "args": [
          {
            "program": [
              [
                "SET",
                0,
                1
              ],
              [
                "JNZ",
                0,
                -3
              ]
            ],
            "limit": 2
          }
        ],
        "expected": {
          "registers": [
            1,
            0,
            0,
            0
          ],
          "pc": -2,
          "steps": 2,
          "reason": "exit"
        }
      }
    ],
    "rubric": [
      "Explain wrapping and operand aliasing.",
      "Explain stopping precedence and why HALT is counted.",
      "Trace a backward branch and discuss which behaviors a real CPU would add."
    ]
  }
];
// Boundary regressions are also part of the learner's pass/fail checks.
PROVING.find(m=>m.id==='frame-decoder').cases.push(
 {args:[['1:a,0:,x']],expected:{frames:['a',''],remainder:'x',error:true}},
 {args:[['000']],expected:{frames:[],remainder:'000',error:true}},
 {args:[['255:'+'x'.repeat(255)+',']],expected:{frames:['x'.repeat(255)],remainder:'',error:false}},
 {args:[['3:abc']],expected:{frames:[],remainder:'3:abc',error:false}},
 {args:[['3a']],expected:{frames:[],remainder:'3a',error:true}}
);
PROVING.find(m=>m.id==='transaction-replay').cases.push(
 {args:[{initial:{a:1,b:2},log:[['begin','t'],['delete','t','a'],['delete','t','missing'],['commit','t'],['commit','t']]}],expected:{b:2}},
 {args:[{initial:{},log:[['begin','t'],['set','t','a',1],['delete','t','a'],['commit','t']]}],expected:{}},
 {args:[{initial:{},log:[['begin','t'],['set','t','a',1],['abort','t'],['begin','t'],['set','t','b',2],['commit','t']]}],expected:{b:2}}
);
PROVING.find(m=>m.id==='byte-machine').cases.push(
 {args:[{program:[['SET',0,513],['SET',1,3],['XOR',0,1],['JNZ',0,2],['HALT'],['ADD',0,1]],limit:6}],expected:{registers:[5,3,0,0],pc:6,steps:5,reason:'exit'}},
 {args:[{program:[['SET',0,1],['SET',1,255],['ADD',0,1],['JNZ',0,-1],['HALT']],limit:5}],expected:{registers:[0,255,0,0],pc:4,steps:5,reason:'halt'}}
);
