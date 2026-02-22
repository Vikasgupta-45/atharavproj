import torch
from datasets import load_dataset
from transformers import (
    T5Tokenizer, 
    T5ForConditionalGeneration, 
    Seq2SeqTrainingArguments, 
    Seq2SeqTrainer,
    DataCollatorForSeq2Seq
)

# 1. Load Model and Tokenizer (t5-small is perfect for a 6GB GPU)
model_name = "t5-small"
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name)

# 2. Load Dataset (JFLEG is a popular, high-quality Grammar Correction dataset)
dataset = load_dataset("jfleg")
prefix = "grammar: "

def preprocess_function(examples):
    inputs = [prefix + text for text in examples["sentence"]]
    # JFLEG provides multiple valid corrections per sentence; we use the first one for training
    targets = [corrections[0] for corrections in examples["corrections"]]
    
    model_inputs = tokenizer(inputs, max_length=128, truncation=True)
    labels = tokenizer(text_target=targets, max_length=128, truncation=True)
    
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

# Tokenize the dataset
print("Tokenizing dataset... this may take a moment.")
tokenized_datasets = dataset.map(preprocess_function, batched=True, remove_columns=["sentence", "corrections"])

# 3. Setup Training Arguments heavily optimized for 6GB VRAM (RTX 4050)
training_args = Seq2SeqTrainingArguments(
    output_dir="./grammar_results",
    eval_strategy="epoch",
    learning_rate=2e-4,
    per_device_train_batch_size=8,  # Small batch to fit entirely in 6GB VRAM
    per_device_eval_batch_size=8,     
    gradient_accumulation_steps=4,  # Simulates a batch size of 32 (8 * 4) without using extra VRAM
    weight_decay=0.01,
    save_total_limit=2,             # Delete older checkpoints to save SSD space
    num_train_epochs=3,             
    predict_with_generate=True,
    fp16=True,                      # ★ CRITICAL: Uses half-precision. Saves nearly 50% VRAM!
    push_to_hub=False,
    logging_steps=50,
)

data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)

# 4. Initialize Trainer
trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["validation"],
    eval_dataset=tokenized_datasets["test"],
    data_collator=data_collator,
    processing_class=tokenizer,
)

# 5. Start Training
print("🚀 Starting fine-tuning! This will engage your RTX 4050...")
trainer.train()

# 6. Save the final model
print("✅ Training complete! Saving your custom grammar model to ./custom_grammar_model")
trainer.save_model("./custom_grammar_model")
tokenizer.save_pretrained("./custom_grammar_model")

# 7. Quick Test!
test_sentence = "grammar: I didn't knew the exact location so I was asking to many peoples."
inputs = tokenizer(test_sentence, return_tensors="pt").to(model.device)
outputs = model.generate(**inputs, max_length=128)
print(f"Original: {test_sentence}")
print(f"Corrected: {tokenizer.decode(outputs[0], skip_special_tokens=True)}")
