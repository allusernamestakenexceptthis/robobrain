#!/bin/bash

pocketsphinx_continuous -logfn /dev/null -time yes -agc noise -vad_threshold 3.0 -inmic yes  -kws keyphrases.list  -dict /home/osmc/pdict/cmdic/cmudict_SPHINX_40

