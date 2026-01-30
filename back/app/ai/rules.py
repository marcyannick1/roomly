def apply_business_rules(student, listing) -> dict:
    multiplier = 1.0
    reasons = []

    if student.max_budget:
        if listing.price <= student.max_budget * 0.9:
            multiplier *= 1.15
            reasons.append("Prix excellent")
        elif listing.price <= student.max_budget:
            multiplier *= 1.1
            reasons.append("Dans votre budget")
        elif listing.price > student.max_budget * 1.1:
            multiplier *= 0.8
            reasons.append("Au-dessus du budget")

    premium = sum([
        listing.wifi,
        listing.washing_machine,
        listing.parking,
        listing.elevator
    ])

    if premium >= 3:
        multiplier *= 1.1
        reasons.append("Très bien équipé")

    if listing.surface and listing.surface > 25:
        multiplier *= 1.05
        reasons.append("Spacieux")

    if listing.min_duration_months and listing.min_duration_months > 12:
        multiplier *= 0.9
        reasons.append("Engagement long")

    return {
        "multiplier": multiplier,
        "reasons": reasons
    }
