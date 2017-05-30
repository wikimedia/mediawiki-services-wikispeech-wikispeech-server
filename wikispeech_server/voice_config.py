

textprocessor_configs = [
    {"name":"wikitextproc_sv", "lang":"sv",
     "components":[
         {
             "module":"adapters.marytts_adapter",
             "call":"marytts_preproc",
             "mapper": {
                 "from":"sv-se_ws-sampa",
                 "to":"sv-se_sampa_mary"
             },
         },
         {
             "module":"adapters.lexicon_client",
             "call":"lexLookup",
             "lexicon":"sv-se.nst"
         }
     ]
    }
    ,
    
    {"name":"wikitextproc_nb", "lang":"nb",
     "components":[
         {
             "module":"adapters.marytts_adapter",
             "call":"marytts_preproc"
#         },
#         {
#             "module":"wikilex",
#             "call":"lexLookup",
#             "lexicon":"no-nb.nst"
         }
     ]
    }
    ,


    {"name":"wikitextproc_en", "lang":"en",
     "components":[
         {
             "module":"adapters.marytts_adapter",
             "call":"marytts_preproc",
             "mapper": {
                 "from":"en-us_ws-sampa",
                 "to":"en-us_sampa_mary"
             },
         },
         {
             "module":"adapters.lexicon_client",
             "call":"lexLookup",
             "lexicon":"en-us.cmu"
         }
     ]
    }
    ,

    {
        "name":"basic_en",
        "lang":"en",
        "components":[
            {
                "module":"tokeniser",
                "call":"tokenise"
            },
            {
                "module":"adapters.lexicon_client",
                "call":"lexLookup",
                "lexicon":"en-us.cmu"
            }
        ]
    }
    ,


    {"name":"wikitextproc_ar", "lang":"ar",
     "components":[
         {
             "module":"adapters.marytts_adapter",
             "call":"marytts_preproc",
             "mapper": {
                 "from":"ar_ws-sampa",
                 "to":"ar_sampa_mary"
             },
         },
         {
             "module":"adapters.lexicon_client",
             "call":"lexLookup",
             "lexicon":"ar-test"
         }
     ]
    }

]


voice_configs = [

    # SWEDISH

    {
        "lang":"sv",
        "name":"stts_sv_nst-hsmm",
        "engine":"marytts",
        "adapter":"adapters.marytts_adapter",
        "mapper": {
            "from":"sv-se_ws-sampa",
            "to":"sv-se_sampa_mary"
            }
    }
    ,
    #TODO
    #{"lang":"sv", "name":"espeak_mbrola_sv1", "engine":"espeak", "adapter":"adapters.espeak_adapter", "espeak_mbrola_voice":"mb-sw1", "espeak_voice":"mb-sw1", "program":{"command":'espeak -v mb-sw1'}}
    #,

    # NORWEGIAN

    {"lang":"nb", "name":"stts_no_nst-hsmm", "engine":"marytts", "adapter":"adapters.marytts_adapter", "marytts_locale":"no"}
    ,

    # ENGLISH
    
    {
        "lang":"en",
        "name":"dfki-spike-hsmm",
        "engine":"marytts",
        "adapter":"adapters.marytts_adapter",
        "marytts_locale":"en_US",
        "mapper": {
            "from":"en-us_ws-sampa",
            "to":"en-us_sampa_mary"
        }
    }
    ,

    {
        "lang":"en",
        "name":"cmu-slt-hsmm",
        "engine":"marytts",
        "adapter":"adapters.marytts_adapter",
        "marytts_locale":"en_US",
        "mapper": {
            "from":"en-us_ws-sampa",
            "to":"en-us_sampa_mary"
        }
    }
    ,

    {
        "lang":"en",
        "name":"cmu-slt-flite",
        "engine":"flite",
        "adapter":"adapters.flite_adapter",
        "flite_voice":"slt"
    }
    ,



    # ARABIC

    {
        "lang":"ar",
        "name":"ar-nah-hsmm",
        "engine":"marytts",
        "adapter":"adapters.marytts_adapter",
        "mapper": {
            "from":"ar_ws-sampa",
            "to":"ar_sampa_mary"
        }
    }    
]