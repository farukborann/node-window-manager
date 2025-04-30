{
  "targets": [
    {
      "target_name": "addon",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "cflags": [ "-std=c++14" ],
      "cflags_cc": [ "-std=c++14", "-stdlib=libc++" ],
      "xcode_settings": {
        "CLANG_CXX_LANGUAGE_STANDARD": "c++14",
        "CLANG_CXX_LIBRARY": "libc++",
        "MACOSX_DEPLOYMENT_TARGET": "10.14",
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
        "CLANG_CXX_LIBRARY": "libc++",
        "OTHER_CPLUSPLUSFLAGS": ["-std=c++14", "-stdlib=libc++"],
        "OTHER_LDFLAGS": ["-stdlib=libc++"]
      },
      "conditions":[
        ["OS=='win'", {
          "sources": [ "lib/windows.cc" ]
        }],
        ["OS=='mac'", {
          "sources": [ "lib/macos.mm" ],
          "libraries": [ "-framework AppKit", "-framework ApplicationServices" ]
        }]
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