# -*- coding: utf-8 -*-
"""minds14 asr test.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1NfW7rC6umLlZv-O_6DOmxvbv4ji3KgvZ
"""

# Commented out IPython magic to ensure Python compatibility.
# %%capture
# ! pip install transformers datasets jiwer lang-trans librosa
# ! pip install torch torchvision torchaudio

from datasets import load_dataset, Audio
from transformers import AutoProcessor
import torch
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Union
from transformers import AutoModelForCTC, TrainingArguments, Trainer


minds = load_dataset("PolyAI/minds14", name="en-US", split="train")

minds = minds.train_test_split(test_size=0.2)

minds = minds.remove_columns(["english_transcription", "intent_class", "lang_id"])

processor = AutoProcessor.from_pretrained("facebook/wav2vec2-base")

minds = minds.cast_column("audio", Audio(sampling_rate=16_000))


def prepare_dataset(batch):
    audio = batch["audio"]

    batch["input_values"] = processor(
        audio["array"], sampling_rate=audio["sampling_rate"]
    ).input_values[0]
    batch["input_length"] = len(batch["input_values"])

    with processor.as_target_processor():
        batch["labels"] = processor(batch["transcription"]).input_ids
    return batch


encoded_minds = minds.map(prepare_dataset, remove_columns=minds.column_names["train"], num_proc=4)


@dataclass
class DataCollatorCTCWithPadding:

    processor: AutoProcessor
    padding: Union[bool, str] = True

    def __call__(
        self, features: List[Dict[str, Union[List[int], torch.Tensor]]]
    ) -> Dict[str, torch.Tensor]:
        # split inputs and labels since they have to be of different lengths and need
        # different padding methods
        input_features = [{"input_values": feature["input_values"]} for feature in features]
        label_features = [{"input_ids": feature["labels"]} for feature in features]

        batch = self.processor.pad(input_features, padding=self.padding, return_tensors="pt")

        labels_batch = self.processor.pad(
            labels=label_features, padding=self.padding, return_tensors="pt"
        )

        # replace padding with -100 to ignore loss correctly
        labels = labels_batch["input_ids"].masked_fill(labels_batch.attention_mask.ne(1), -100)

        batch["labels"] = labels

        return batch


data_collator = DataCollatorCTCWithPadding(processor=processor, padding=True)


model = AutoModelForCTC.from_pretrained(
    "facebook/wav2vec2-base",
    ctc_loss_reduction="mean",
    pad_token_id=processor.tokenizer.pad_token_id,
)

training_args = TrainingArguments(
    output_dir="./results",
    group_by_length=True,
    per_device_train_batch_size=2,
    evaluation_strategy="steps",
    num_train_epochs=1,
    fp16=False,
    gradient_checkpointing=True,
    learning_rate=1e-4,
    weight_decay=0.005,
    save_total_limit=2,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=encoded_minds["train"],
    eval_dataset=encoded_minds["test"],
    tokenizer=processor.feature_extractor,
    data_collator=data_collator,
)

trainer.train()
