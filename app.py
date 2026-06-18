from flask import Flask, render_template, request, jsonify
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import random

app = Flask(__name__)
analyzer = SentimentIntensityAnalyzer()

# Suggestion Dictionary
SUGGESTIONS = {
    "Happy": [
        "That's wonderful! Keep spreading that positive energy!",
        "Happiness is contagious! Enjoy this moment and keep smiling.",
        "Your positivity is inspiring! What's making you extra happy today?",
        "Wonderful to hear! Why not share this joy with someone else?"
    ],
    "Sad": [
        "It's okay to feel sad. Take a deep breath, things will get better.",
        "Remember that every cloud has a silver lining. Be kind to yourself.",
        "Sending you a virtual hug. You're stronger than you think.",
        "Take things one step at a time. Better days are ahead."
    ],
    "Angry": [
        "Try taking a few deep breaths. It helps to clear your mind.",
        "It's natural to feel frustrated. Maybe a short walk could help?",
        "Take a moment to pause before reacting. You've got this.",
        "Channel that energy into something productive or calming."
    ],
    "Stress": [
        "Take a moment to unplug and breathe. Your well-being comes first.",
        "Don't forget to take breaks. You're doing the best you can.",
        "It's okay to step back and rest. Slow down for a while.",
        "Focus on one small task at a time. You don't have to do it all at once."
    ],
    "Neutral": [
        "Balance is key. It's a good time to reflect or plan ahead.",
        "A calm mind is a powerful mind. Stay steady.",
        "Neutral ground is a great place to start something new.",
        "Keep maintaining your inner peace and balance."
    ]
}

def get_emotion_category(text, sentiment_scores):
    """
    Categorizes the emotion based on TextBlob polarity and VADER scores.
    """
    compound = sentiment_scores['compound']
    polarity = TextBlob(text).sentiment.polarity
    
    # Simple logic to map scores to emotional categories
    if compound >= 0.5:
        return "Happy"
    elif compound <= -0.5:
        if "angry" in text.lower() or "mad" in text.lower() or "hate" in text.lower():
            return "Angry"
        return "Sad"
    elif -0.5 < compound < 0.5:
        if compound < 0 and (abs(compound) > 0.2) or "stressed" in text.lower() or "anxiety" in text.lower():
            return "Stress"
        if abs(compound) < 0.1 and abs(polarity) < 0.1:
            return "Neutral"
        return "Neutral" # Default to Neutral for mild scores
    
    return "Neutral"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    message = data.get('message', '')
    
    if not message:
        return jsonify({"error": "No message provided"}), 400
    
    # Sentiment Analysis with VADER
    vs = analyzer.polarity_scores(message)
    
    # Determine Sentiment Label
    if vs['compound'] >= 0.05:
        sentiment = "Positive"
    elif vs['compound'] <= -0.05:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"
    
    # Determine Emotion Category
    emotion = get_emotion_category(message, vs)
    
    # Get a random supportive suggestion
    suggestion = random.choice(SUGGESTIONS.get(emotion, SUGGESTIONS["Neutral"]))
    
    # Prepare result
    result = {
        "sentiment": sentiment,
        "emotion": emotion,
        "suggestion": suggestion,
        "confidence": round(abs(vs['compound']) * 100, 2), # Using compound score as a proxy for confidence
        "scores": {
            "pos": vs['pos'],
            "neu": vs['neu'],
            "neg": vs['neg'],
            "compound": vs['compound']
        }
    }
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
