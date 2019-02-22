#!/bin/bash

pocketsphinx_continuous -logfn /dev/null -time yes -agc noise -vad_threshold 3.0 -inmic yes  -kws keyphrases.list  -dict /home/osmc/pdict/cmdic/cmudict_SPHINX_40

#-inmic yes  -kws keyphrases.list -hmm /usr/local/share/pocketsphinx/model/en-us/en-us -lm /usr/local/share/pocketsphinx/model/en-us/en-us.lm.bin  -dict /usr/local/share/pocketsphinx/model/en-us/cmudict-en-us.dict

#-inmic yes  -kws keyphrases.list -hmm /usr/local/share/pocketsphinx/model/en-us/en-us -lm /usr/local/share/pocketsphinx/model/en-us/en-us.lm.bin  -dict /home/osmc/pdict/cmdic/cmudict_SPHINX_40
# -samprate 16000 
#-nfft 2048 
#rec -q -r 16000 -c 1 -e signed-integer -b 16 -t wav -  | pocketsphinx_continuous  -samprate 16000 -nfft 2048 -infile /dev/stdin  -kws keyphrases.list

