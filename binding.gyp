{
  "targets": [
    {
      "target_name": "addon",
      "cflags!": [
        "-fno-exceptions"
      ],
      "cflags_cc!": [
        "-fno-exceptions"
      ],
      "cflags": [
        "-std=c++17"
      ],
      "cflags_cc": [
        "-std=c++17",
        "-stdlib=libc++"
      ],
      "xcode_settings": {
        "CLANG_CXX_LANGUAGE_STANDARD": "c++17",
        "CLANG_CXX_LIBRARY": "libc++",
        "MACOSX_DEPLOYMENT_TARGET": "10.14",
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
        "OTHER_CPLUSPLUSFLAGS": [
          "-std=c++17",
          "-stdlib=libc++"
        ],
        "OTHER_LDFLAGS": [
          "-stdlib=libc++"
        ]
      },
      "conditions": [
        [
          "OS=='win'",
          {
            "sources": [
              "lib/windows.cc"
            ]
          }
        ],
        [
          "OS=='mac'",
          {
            "sources": [
              "lib/macos.mm"
            ],
            "libraries": [
              "-framework AppKit",
              "-framework ApplicationServices"
            ]
          }
        ]
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS",
        "NODE_ADDON_API_ENABLE_MAYBE"
      ]
    }
  ]
}