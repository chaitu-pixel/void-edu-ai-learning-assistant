from typing import Dict, Any


def evaluate_mcq_quiz(mcqs: list[dict], user_answers: Dict[str, str]) -> dict:
    """
    mcqs: list of {id, question, options, answer}
    user_answers: {"q1":"A", "q2":"C", ...}
    """
    total = len(mcqs)
    correct = 0
    details = []

    for q in mcqs:
        qid = q["id"]
        correct_ans = str(q["answer"]).strip().upper()
        given_ans = str(user_answers.get(qid, "")).strip().upper()

        is_correct = (given_ans == correct_ans)
        if is_correct:
            correct += 1

        details.append({
            "id": qid,
            "given": given_ans if given_ans else None,
            "correct": correct_ans,
            "is_correct": is_correct
        })

    accuracy = (correct / total * 100) if total else 0.0
    return {
        "score": correct,
        "total": total,
        "accuracy": round(accuracy, 2),
        "details": details
    }
