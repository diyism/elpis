    增加单个容器的容量(默认10GB不够), 在/etc/docker/daemon.json里加上:
      "storage-opts": [
        "dm.basesize=20G"
      ]
    然后:
    $ sudo systemctl restart docker

    $ docker inspect --format='{{json .Config.Entrypoint}}' coedl/elpis:latest
    ["poetry","run","flask","--debug","run","--host","0.0.0.0","--port","5001"]
    
    $ docker run -it --entrypoint bash -p 5001:5001/tcp -p 6006:6006/tcp coedl/elpis:latest
    
    root@7a359096db10:/elpis# pip install packaging==23.1
    
    root@7a359096db10:/elpis# poetry run flask --debug run --host 0.0.0.0 --port 5001
    
    从浏览器访问: http://127.0.0.1:5001/
    网页界面 上传 语音 和 抄写 文件时, 抄写 文件格式 要求 .eaf Elan transcription,
    里面有每个音节的开始和结束时间戳, 对于个人训练来说太麻烦了
    训练openWakeWord项目更简单: https://github.com/dscripka/openWakeWord/


<p align="center"><img src="docs/img/elpis.png" width="250px"/></p>

# Elpis (Accelerated Transcription)

[![Build Status](https://travis-ci.org/CoEDL/elpis.svg?branch=master)](https://travis-ci.org/CoEDL/elpis)
[![Coverage Status](https://coveralls.io/repos/github/CoEDL/elpis/badge.svg?branch=master)](https://coveralls.io/github/CoEDL/elpis?branch=master)

Elpis is a tool which allows language workers with minimal computational experience to build their own speech recognition models 
to automatically transcribe audio. Elpis provides a way to use multiple speech recognition systems for orthographic or phonemic transcription. The current systems included are [Kaldi](https://kaldi-asr.org) and [Huggingface Transformers wav2vec2](https://huggingface.co/docs/transformers/model_doc/wav2vec2).

<p align="center">
    <img src="docs/img/elpis-pipeline.svg" width="100%" style="margin: 40px 40px 60px 40px;" />
</p>


## How can I use Elpis?

Documentation is [here](https://elpis.readthedocs.io/).


## I'm An Academic, How Do I Cite This In My Research?

This software is the product of academic research funded by the Australian Research Council 
[Centre of Excellence for the Dynamics of Language](http://www.dynamicsoflanguage.edu.au/). If you use the software in 
an academic setting, please cite it appropriately as follows:

> Foley, B., Arnold, J., Coto-Solano, R., Durantin, G., Ellison, T. M., van Esch, D., Heath, S., Kratochvíl, F.,
Maxwell-Smith, Z., Nash, D., Olsson, O., Richards, M., San, N., Stoakes, H., Thieberger, N. & Wiles,
J. (2018). Building Speech Recognition Systems for Language Documentation: The CoEDL Endangered
Language Pipeline and Inference System (Elpis). In S. S. Agrawal (Ed.), *The 6th Intl. Workshop on Spoken
Language Technologies for Under-Resourced Languages (SLTU)* (pp. 200–204). Available on https://www.isca-speech.org/archive/SLTU_2018/pdfs/Ben.pdf.


<p align="center">
    <img src="docs/img/coedl.png" width="250px" style="margin-right: 40px"/> 
    <img src="docs/img/uq.png" width="125px" style="margin-left: 40px"/>
</p>

