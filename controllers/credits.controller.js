export const grantCredit = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        // Map product IDs to credit values
        const creditMap = {
            credits_5: 5,
            credits_10: 10,
            credits_25: 25
        };

        const creditsToGrant = creditMap[productId];

        if (!creditsToGrant) {
            return res.status(400).json({ success: false, error: 'Invalid productId' });
        }

        user.credits += creditsToGrant;
        await user.save();

        return res.status(200).json({ success: true, user, message: `${creditsToGrant} credits granted.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
