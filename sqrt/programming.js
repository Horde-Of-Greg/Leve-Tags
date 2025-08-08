
const g = "The code knows if it's correct at all times. It knows this because it knows where it is incorrect. By subtracting the incorrect parts from where it is correct, or where it is incorrect from where it correct (whichever is greater), it obtains a difference, or deviation. The build process uses AI to generate corrective diffs to change the code from a revision where it is correct to a revision where it isn't, and arriving at a revision where it wasn't, it now is. Consequently, the revision where it is, is now the revision that it wasn't incorrect, and it follows that the revision where it was incorrect, is now the revision that it isn't. In the event that the revision that it is in is not the revision that it wasn't incorrect, the system has acquired a variation, the variation being the difference between where the unit tests are green, and where they are red. If variation is considered to be a significant factor, it too may be corrected by the AI. However, the code must also know where it was incorrect. The code AI generation scenario works as follows. Because a variation has modified some of the information the code has obtained, it is not sure just what is incorrect. However, it is sure what is correct, within reason, and it knows where it was correct. It now subtracts what should be correct from what wasn't, or vice-versa, and by differentiating this from the algebraic sum of where it shouldn't be, and where it was, it is able to obtain the deviation and its variation, which is called error.";

msg.reply({
    embed: {
        description: g
    }
});
