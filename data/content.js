/* Local data: generated from assets/data/release.json, assets/data/results.json and data/comparisons.json. */
window.ELIGSIR_CONTENT = {
  "release": {
    "release": "icra27-rc2",
    "core": "fa859ba3c37240d3dfdf79d4d65e8c9d47f00f4b",
    "ros2": "e4c3249752c9241887595eac05a0ca06d89be584",
    "rgbd_sync": "9a5930762806bd56af99c7176352e70c21733b91",
    "gsplat_rocm": "c6b363ab9239c958a4ac6619f725119dc8e5706b",
    "image_digests": {
      "core": {
        "cuda": "sha256:85283937f9571cd91dd78af80287baab25eaf1ee6d57da8b03c73e96f3294a58",
        "rocm": "sha256:bdf2da71a0fde621a3cb044be0728a9169b5f09126860fbe48f2f21fa14234f3"
      },
      "ros2": {
        "cuda": "sha256:a78fca70428ac395743faf5e823f53c32ab4829245b2216430abd4163dc17881",
        "rocm": "sha256:0953233f571afb31153322dd706d5d1883b24cf8b16ee5327619fe13bdca83c8"
      }
    }
  },
  "results": {
    "schema_version": 2,
    "source": {
      "description": "Final anonymous ICRA 2027 manuscript, Tables I-III and Figs. 3, 4 and 6. Values transcribed from the paper, not rerun.",
      "release_status": "final-review-manuscript",
      "caution": "Table I, Table II and Table III use separate runs and evaluation splits; absolute PSNR values should not be compared across these blocks."
    },
    "map_states": {
      "ME": "EliGSiR after the input stream and a bounded drain of already scheduled work (mapping end).",
      "NC": "Completed native pipeline of RTG-SLAM or SplaTAM.",
      "NT": "Short native post-stream tail of CaRtGS.",
      "+Nk PM": "N thousand additional post-mapping updates. VarSplat's +30k PM includes global optimization and bundle adjustment."
    },
    "online": {
      "scene": "TUM RGB-D fr3/long_office_household",
      "acquisition_seconds": 87.14,
      "note": "Real-time factor (RTF) = elapsed processing time / 87.14 s acquisition duration; 1x is real time. Evaluation rendering is excluded from mapping time.",
      "rows": [
        {
          "id": "eligsir-gt",
          "method": "EliGSiR",
          "poses": "gt",
          "map_state": "ME",
          "psnr_db": 21.52,
          "ssim": 0.757,
          "lpips": 0.32,
          "seconds": 176.1,
          "rtf": 2.02
        },
        {
          "id": "splatam-gt",
          "method": "SplaTAM",
          "poses": "gt",
          "map_state": "NC",
          "psnr_db": 19.42,
          "ssim": 0.703,
          "lpips": 0.445,
          "seconds": 1382.6,
          "rtf": 15.87
        },
        {
          "id": "varsplat-gt",
          "method": "VarSplat",
          "poses": "gt",
          "map_state": "+30k PM",
          "psnr_db": 16.44,
          "ssim": 0.574,
          "lpips": 0.51,
          "seconds": 2495.5,
          "rtf": 28.64
        },
        {
          "id": "rtgslam-gt",
          "method": "RTG-SLAM",
          "poses": "gt",
          "map_state": "NC",
          "psnr_db": 14.46,
          "ssim": 0.553,
          "lpips": 0.614,
          "seconds": 1147.8,
          "rtf": 13.17
        },
        {
          "id": "eligsir-tracked",
          "method": "EliGSiR",
          "poses": "tracked",
          "tracker": "live ORB-SLAM3",
          "map_state": "ME",
          "psnr_db": 23.02,
          "ssim": 0.803,
          "lpips": 0.276,
          "seconds": 155.5,
          "rtf": 1.78
        },
        {
          "id": "cartgs-tracked",
          "method": "CaRtGS",
          "poses": "tracked",
          "tracker": "native",
          "map_state": "NT",
          "psnr_db": 20.1,
          "ssim": 0.689,
          "lpips": 0.363,
          "seconds": 230.9,
          "rtf": 2.65
        }
      ]
    },
    "scenes": [
      {
        "scene": "Replica office0",
        "rows": [
          {
            "method": "RTG-SLAM",
            "map_state": "NC",
            "psnr_db": 34.62,
            "ssim": 0.94,
            "lpips": 0.263,
            "seconds": 412.4
          },
          {
            "method": "VarSplat",
            "map_state": "+30k PM",
            "psnr_db": 40.91,
            "ssim": 0.972,
            "lpips": 0.203,
            "seconds": 3742.2
          },
          {
            "method": "EliGSiR",
            "map_state": "ME",
            "psnr_db": 34.2,
            "ssim": 0.938,
            "lpips": 0.223,
            "seconds": 324.0,
            "footnote": "Timestamp-derived; includes evaluation/video generation."
          }
        ]
      },
      {
        "scene": "Replica room2",
        "rows": [
          {
            "method": "EliGSiR",
            "map_state": "+2k PM",
            "psnr_db": 37.07,
            "ssim": 0.964,
            "lpips": 0.137,
            "seconds": 746.4
          }
        ]
      },
      {
        "scene": "Orbbec floor2",
        "rows": [
          {
            "method": "RTG-SLAM",
            "map_state": "NC",
            "psnr_db": 18.52,
            "ssim": 0.718,
            "lpips": 0.461,
            "seconds": 775.2
          },
          {
            "method": "SplaTAM",
            "map_state": "NC",
            "psnr_db": 21.4,
            "ssim": 0.782,
            "lpips": 0.39,
            "seconds": 18349.6
          },
          {
            "method": "VarSplat",
            "map_state": "+30k PM",
            "psnr_db": 25.88,
            "ssim": 0.883,
            "lpips": 0.254,
            "seconds": 2274.7
          },
          {
            "method": "EliGSiR",
            "map_state": "ME",
            "psnr_db": 16.27,
            "ssim": 0.601,
            "lpips": 0.51,
            "seconds": 555.1
          }
        ]
      },
      {
        "scene": "Orbbec kitchen1",
        "rows": [
          {
            "method": "RTG-SLAM",
            "map_state": "NC",
            "psnr_db": 16.75,
            "ssim": 0.669,
            "lpips": 0.506,
            "seconds": 408.0
          },
          {
            "method": "SplaTAM",
            "map_state": "NC",
            "psnr_db": 17.59,
            "ssim": 0.731,
            "lpips": 0.447,
            "seconds": 2456.7
          },
          {
            "method": "CaRtGS",
            "map_state": "NT",
            "psnr_db": 20.12,
            "ssim": 0.856,
            "lpips": 0.281,
            "seconds": 99.2,
            "footnote": "Mapping time only; excludes the per-view pose refinement used to obtain the reported CaRtGS score."
          },
          {
            "method": "EliGSiR",
            "map_state": "ME",
            "psnr_db": 23.5,
            "ssim": 0.84,
            "lpips": 0.248,
            "seconds": 203.3
          }
        ]
      },
      {
        "scene": "ScanNet++ 8b5caf3398",
        "rows": [
          {
            "method": "EliGSiR",
            "map_state": "ME",
            "psnr_db": 19.58,
            "ssim": 0.817,
            "lpips": 0.307,
            "seconds": 390.9
          }
        ]
      },
      {
        "scene": "TUM RGB-D fr1/desk",
        "rows": [
          {
            "method": "RTG-SLAM",
            "map_state": "NC",
            "psnr_db": 16.07,
            "ssim": 0.559,
            "lpips": 0.57,
            "seconds": 707.0
          },
          {
            "method": "SplaTAM",
            "map_state": "NC",
            "psnr_db": 18.75,
            "ssim": 0.659,
            "lpips": 0.471,
            "seconds": 4726.5
          },
          {
            "method": "EliGSiR",
            "map_state": "+30k PM",
            "psnr_db": 20.6,
            "ssim": 0.729,
            "lpips": 0.408,
            "seconds": 678.3
          }
        ]
      }
    ],
    "refinement": {
      "scene": "TUM RGB-D fr3/long_office_household",
      "note": "Separate 4k, 8k and 16k refinement runs on a 45-view split distinct from Table I. RGB metrics use the original holdout poses after training-pose alignment. Depth RMSE uses representative retained views. Total time includes mapping and refinement.",
      "rows": [
        {
          "steps": 0,
          "stage": "Mapping end",
          "updates": 1372,
          "psnr_db": 23.27,
          "ssim": 0.807,
          "lpips": 0.269,
          "depth_rmse_m": 0.459,
          "gaussians_k": 328.1,
          "total_seconds": 144.9
        },
        {
          "steps": 4000,
          "stage": "+4k PM",
          "updates": 5372,
          "psnr_db": 23.64,
          "ssim": 0.814,
          "lpips": 0.264,
          "depth_rmse_m": 0.356,
          "gaussians_k": 356.6,
          "total_seconds": 1166.5
        },
        {
          "steps": 8000,
          "stage": "+8k PM",
          "updates": 9351,
          "psnr_db": 24.44,
          "ssim": 0.837,
          "lpips": 0.235,
          "depth_rmse_m": 0.347,
          "gaussians_k": 367.5,
          "total_seconds": 2188.6
        },
        {
          "steps": 16000,
          "stage": "+16k PM",
          "updates": 17102,
          "psnr_db": 25.62,
          "ssim": 0.855,
          "lpips": 0.213,
          "depth_rmse_m": 0.352,
          "gaussians_k": 381.3,
          "total_seconds": 5062.1
        }
      ]
    },
    "ablations": {
      "note": "Online ablations; runs are separate from Table I. Endpoint PSNR measures final global quality; CVQ-AUC and CUC@20 measure regional quality during acquisition. Supervised pixels and Gaussian count report optimization work and map size.",
      "scenes": [
        {
          "scene": "TUM RGB-D fr3/long_office_household",
          "rows": [
            {
              "variant": "EliGSiR",
              "psnr_db": 18.5,
              "cvq_auc_db": 21.18,
              "cuc20_pct": 69.2,
              "supervised_mpix": 398.2,
              "gaussians_k": 140.1
            },
            {
              "variant": "w/o adaptive fidelity",
              "psnr_db": 19.36,
              "cvq_auc_db": 20.62,
              "cuc20_pct": 65.4,
              "supervised_mpix": 2786.9,
              "gaussians_k": 549.5
            },
            {
              "variant": "w/o targeted growth",
              "psnr_db": 17.78,
              "cvq_auc_db": 20.84,
              "cuc20_pct": 63.1,
              "supervised_mpix": 330.9,
              "gaussians_k": 120.5
            }
          ]
        },
        {
          "scene": "ScanNet++ 8b5caf3398",
          "rows": [
            {
              "variant": "EliGSiR",
              "psnr_db": 18.71,
              "cvq_auc_db": 16.28,
              "cuc20_pct": 23.2,
              "supervised_mpix": 17559.6,
              "gaussians_k": 366.5
            },
            {
              "variant": "w/o adaptive fidelity",
              "psnr_db": 18.58,
              "cvq_auc_db": 16.36,
              "cuc20_pct": 16.4,
              "supervised_mpix": 25613.1,
              "gaussians_k": 341.5
            },
            {
              "variant": "w/o targeted growth",
              "psnr_db": 18.59,
              "cvq_auc_db": 16.59,
              "cuc20_pct": 17.7,
              "supervised_mpix": 14242.3,
              "gaussians_k": 1108.8
            }
          ]
        },
        {
          "scene": "Orbbec kitchen1",
          "rows": [
            {
              "variant": "EliGSiR",
              "psnr_db": 18.25,
              "cvq_auc_db": 19.75,
              "cuc20_pct": 55.3,
              "supervised_mpix": 285.6,
              "gaussians_k": 123.9
            },
            {
              "variant": "w/o adaptive fidelity",
              "psnr_db": 22.91,
              "cvq_auc_db": 20.44,
              "cuc20_pct": 77.9,
              "supervised_mpix": 2267.1,
              "gaussians_k": 565.0
            },
            {
              "variant": "w/o targeted growth",
              "psnr_db": 18.63,
              "cvq_auc_db": 19.55,
              "cuc20_pct": 53.3,
              "supervised_mpix": 276.9,
              "gaussians_k": 70.7
            }
          ]
        }
      ]
    }
  },
  "comparisons": {
    "schema_version": 2,
    "note": "Panels from the paper's Figs. 7 and 8, matched viewpoints; depth uses one shared metric range.",
    "colorbar": {
      "image": "assets/qualitative/depth-colorbar-0.3-5m.webp",
      "caption": "Metric depth (m), shared range 0.3\u20135.0"
    },
    "default": {
      "group": "fr3-1152",
      "view": "fr3-1152",
      "mode": "rgb"
    },
    "groups": [
      {
        "id": "fr3-1152",
        "label": "TUM fr3 \u00b7 view 1152",
        "baseline_label": "CaRtGS",
        "modes": [
          "rgb",
          "depth"
        ]
      },
      {
        "id": "fr3-cartgs",
        "label": "TUM fr3 \u00b7 vs CaRtGS",
        "baseline_label": "CaRtGS",
        "modes": [
          "rgb"
        ],
        "source": "observed trajectory \u00b7 both maps rendered from the same ground-truth pose \u00b7 per-frame PSNR (640\u00d7480)"
      },
      {
        "id": "fr3-splatam",
        "label": "TUM fr3 \u00b7 vs SplaTAM",
        "baseline_label": "SplaTAM",
        "modes": [
          "rgb"
        ],
        "source": "observed trajectory \u00b7 both maps rendered from the same ground-truth pose \u00b7 per-frame PSNR (640\u00d7480)"
      },
      {
        "id": "kitchen1-865",
        "label": "kitchen1 \u00b7 source 865",
        "baseline_label": "CaRtGS",
        "modes": [
          "rgb",
          "depth"
        ]
      },
      {
        "id": "scannet",
        "label": "ScanNet \u00b7 views 48 / 2624 / 5872",
        "baseline_label": "Reference",
        "modes": [
          "rgb"
        ]
      },
      {
        "id": "scannetpp",
        "label": "ScanNet++ \u00b7 views 8 / 5624 / 6752",
        "baseline_label": "Reference",
        "modes": [
          "rgb"
        ]
      }
    ],
    "views": [
      {
        "id": "fr3-1152",
        "group": "fr3-1152",
        "label": "View 1152",
        "images": {
          "reference_rgb": "assets/qualitative/fr3-1152-reference-rgb.webp",
          "baseline_rgb": "assets/qualitative/fr3-1152-cartgs-rgb.webp",
          "eligsir_rgb": "assets/qualitative/fr3-1152-eligsir-rgb.webp",
          "reference_depth": "assets/qualitative/fr3-1152-reference-depth.webp",
          "baseline_depth": "assets/qualitative/fr3-1152-cartgs-depth.webp",
          "eligsir_depth": "assets/qualitative/fr3-1152-eligsir-depth.webp"
        },
        "metrics": {
          "rgb": {
            "baseline": "CaRtGS \u00b7 PSNR 26.23 dB",
            "eligsir": "EliGSiR \u00b7 PSNR 26.71 dB"
          },
          "depth": {
            "baseline": "MAE \u2264 2 m: 22.19 cm",
            "eligsir": "12.74 cm"
          }
        },
        "width": 541,
        "height": 405
      },
      {
        "id": "fr3-cartgs-0705",
        "group": "fr3-cartgs",
        "label": "Frame 705",
        "images": {
          "reference_rgb": "assets/qualitative/fr3-traj0705-reference.webp",
          "baseline_rgb": "assets/qualitative/fr3-traj0705-cartgs.webp",
          "eligsir_rgb": "assets/qualitative/fr3-traj0705-eligsir.webp"
        },
        "metrics": {
          "rgb": {
            "baseline": "CaRtGS \u00b7 PSNR 17.56 dB",
            "eligsir": "EliGSiR \u00b7 PSNR 23.45 dB"
          }
        },
        "width": 960,
        "height": 720
      },
      {
        "id": "fr3-cartgs-2570",
        "group": "fr3-cartgs",
        "label": "Frame 2570",
        "images": {
          "reference_rgb": "assets/qualitative/fr3-traj2570-reference.webp",
          "baseline_rgb": "assets/qualitative/fr3-traj2570-cartgs.webp",
          "eligsir_rgb": "assets/qualitative/fr3-traj2570-eligsir.webp"
        },
        "metrics": {
          "rgb": {
            "baseline": "CaRtGS \u00b7 PSNR 20.68 dB",
            "eligsir": "EliGSiR \u00b7 PSNR 26.31 dB"
          }
        },
        "width": 960,
        "height": 720
      },
      {
        "id": "fr3-cartgs-0280",
        "group": "fr3-cartgs",
        "label": "Frame 280",
        "images": {
          "reference_rgb": "assets/qualitative/fr3-traj0280-reference.webp",
          "baseline_rgb": "assets/qualitative/fr3-traj0280-cartgs.webp",
          "eligsir_rgb": "assets/qualitative/fr3-traj0280-eligsir.webp"
        },
        "metrics": {
          "rgb": {
            "baseline": "CaRtGS \u00b7 PSNR 21.54 dB",
            "eligsir": "EliGSiR \u00b7 PSNR 25.35 dB"
          }
        },
        "width": 960,
        "height": 720
      },
      {
        "id": "fr3-traj1065",
        "group": "fr3-splatam",
        "label": "Frame 1065",
        "images": {
          "reference_rgb": "assets/qualitative/fr3-traj1065-reference.webp",
          "baseline_rgb": "assets/qualitative/fr3-traj1065-splatam.webp",
          "eligsir_rgb": "assets/qualitative/fr3-traj1065-eligsir.webp"
        },
        "metrics": {
          "rgb": {
            "baseline": "SplaTAM \u00b7 PSNR 16.44 dB",
            "eligsir": "EliGSiR \u00b7 PSNR 24.76 dB"
          }
        },
        "width": 960,
        "height": 720
      },
      {
        "id": "fr3-traj0330",
        "group": "fr3-splatam",
        "label": "Frame 330",
        "images": {
          "reference_rgb": "assets/qualitative/fr3-traj0330-reference.webp",
          "baseline_rgb": "assets/qualitative/fr3-traj0330-splatam.webp",
          "eligsir_rgb": "assets/qualitative/fr3-traj0330-eligsir.webp"
        },
        "metrics": {
          "rgb": {
            "baseline": "SplaTAM \u00b7 PSNR 17.53 dB",
            "eligsir": "EliGSiR \u00b7 PSNR 25.51 dB"
          }
        },
        "width": 960,
        "height": 720
      },
      {
        "id": "fr3-traj1880",
        "group": "fr3-splatam",
        "label": "Frame 1880",
        "images": {
          "reference_rgb": "assets/qualitative/fr3-traj1880-reference.webp",
          "baseline_rgb": "assets/qualitative/fr3-traj1880-splatam.webp",
          "eligsir_rgb": "assets/qualitative/fr3-traj1880-eligsir.webp"
        },
        "metrics": {
          "rgb": {
            "baseline": "SplaTAM \u00b7 PSNR 19.24 dB",
            "eligsir": "EliGSiR \u00b7 PSNR 26.49 dB"
          }
        },
        "width": 960,
        "height": 720
      },
      {
        "id": "kitchen1-865",
        "group": "kitchen1-865",
        "label": "Source 865",
        "images": {
          "reference_rgb": "assets/qualitative/kitchen1-865-reference-rgb.webp",
          "baseline_rgb": "assets/qualitative/kitchen1-865-cartgs-rgb.webp",
          "eligsir_rgb": "assets/qualitative/kitchen1-865-eligsir-rgb.webp",
          "reference_depth": "assets/qualitative/kitchen1-865-reference-depth.webp",
          "baseline_depth": "assets/qualitative/kitchen1-865-cartgs-depth.webp",
          "eligsir_depth": "assets/qualitative/kitchen1-865-eligsir-depth.webp"
        },
        "metrics": {
          "rgb": {
            "baseline": "CaRtGS \u00b7 PSNR 20.10 dB",
            "eligsir": "EliGSiR \u00b7 PSNR 22.49 dB"
          },
          "depth": {
            "baseline": "MAE \u2264 2 m: 9.20 cm",
            "eligsir": "7.18 cm"
          }
        },
        "width": 541,
        "height": 405
      },
      {
        "id": "scannet-000048",
        "group": "scannet",
        "label": "View 48",
        "images": {
          "reference_rgb": "assets/qualitative/scannet-000048-reference.webp",
          "baseline_rgb": "assets/qualitative/scannet-000048-reference.webp",
          "eligsir_rgb": "assets/qualitative/scannet-000048-eligsir.webp"
        },
        "width": 1280,
        "height": 955
      },
      {
        "id": "scannet-002624",
        "group": "scannet",
        "label": "View 2624",
        "images": {
          "reference_rgb": "assets/qualitative/scannet-002624-reference.webp",
          "baseline_rgb": "assets/qualitative/scannet-002624-reference.webp",
          "eligsir_rgb": "assets/qualitative/scannet-002624-eligsir.webp"
        },
        "width": 1280,
        "height": 955
      },
      {
        "id": "scannet-005872",
        "group": "scannet",
        "label": "View 5872",
        "images": {
          "reference_rgb": "assets/qualitative/scannet-005872-reference.webp",
          "baseline_rgb": "assets/qualitative/scannet-005872-reference.webp",
          "eligsir_rgb": "assets/qualitative/scannet-005872-eligsir.webp"
        },
        "width": 1280,
        "height": 955
      },
      {
        "id": "scannetpp-000008",
        "group": "scannetpp",
        "label": "View 8",
        "images": {
          "reference_rgb": "assets/qualitative/scannetpp-000008-reference.webp",
          "baseline_rgb": "assets/qualitative/scannetpp-000008-reference.webp",
          "eligsir_rgb": "assets/qualitative/scannetpp-000008-eligsir.webp"
        },
        "width": 1280,
        "height": 959
      },
      {
        "id": "scannetpp-005624",
        "group": "scannetpp",
        "label": "View 5624",
        "images": {
          "reference_rgb": "assets/qualitative/scannetpp-005624-reference.webp",
          "baseline_rgb": "assets/qualitative/scannetpp-005624-reference.webp",
          "eligsir_rgb": "assets/qualitative/scannetpp-005624-eligsir.webp"
        },
        "width": 1280,
        "height": 959
      },
      {
        "id": "scannetpp-006752",
        "group": "scannetpp",
        "label": "View 6752",
        "images": {
          "reference_rgb": "assets/qualitative/scannetpp-006752-reference.webp",
          "baseline_rgb": "assets/qualitative/scannetpp-006752-reference.webp",
          "eligsir_rgb": "assets/qualitative/scannetpp-006752-eligsir.webp"
        },
        "width": 1280,
        "height": 959
      }
    ]
  },
  "viewer": {
    "scenes": {
      "fr3": 9292312,
      "kitchen1": 7657776,
      "office0": 7249308,
      "room2": 9349174,
      "scannetpp": 18812064
    }
  }
};
