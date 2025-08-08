
const a = `Smelting with the ferocity of the universe itself. This unbelievable material seemed impossible to manipulate into a coil block form, even though its properties made this desirable. It is incredibly stable even at extreme temperatures, but this also made it unable to pack together for coils. However, the situation changed when you thought about using something more intelligent. By integrating a Wetware or better UHV circuit, the Infinity Coil became a reality, controlled by the ever-watching eyes of the circuitry you've spent months to create. From now on, these eyes will watch over your multiblocks.

Forged from the blood of an ageless dragon, and melded together by the power of fusion beyond what you thought was the reality. No natural element, or combination of elements could match up to this glowing orange material, not even the Awakened Draconium you got your hands on before. What truly happened inside that Mk4 Fusion Reactor? What *is* this material? Its dust pulsates visibly, at different rates depending on the size of the dust itself. Hypogen approaches a state of complete balance as it approaches the block size, and it is obvious to you what needs to be done with it. It absorbs and radiates energy without any effort, but it would be stupid to attempt making coils out of this without assistance. Wetware wasn't good anymore, and only the most advanced living circuit could withstand the erratic behavior Hypogen has.

Beyond spacetime, beyond reality. You have peered into what never existed and brought into a fluid, and then a solid. It has been stabilized, against all odds. When you look at it, you think that you could hold the entire universe in your hand. In the past, you were able to combine almost all materials into one, through an Eternal Singularity, an infinitely dense sample of the universe. However, automating this at the scale of the DTPF proved ridiculous, which would have stopped your progress altogether if not for the discovery of the Energized Tesseract. To physically manifest spacetime itself, you first needed to manifest the fourth spatial dimension, and that is what the Tesseract is: a 4-dimensional cube. Cubes! Almost everything around you is made out of cubes. You have only glimpsed at the reality of the 4-dimensional world, but you have successfully used it to condensate spacetime, which can be arbitrarily molded into the complete Eternal mixture, a process that unfortunately cannot be reversed. Needless to say, living circuits will not suffice to maintain an infinitely dense, infinitely stable, multi-dimensional material.`;

const b = `I've started rewriting GCP quests pls tell me what u think

wetware mainframe quest: "Circuit for UHV."

cupronickel coil block quest:  "Blood roils through your veins as the harsh words of the townsfolk echo in your ears....they think you mad. But you are not merely a lunatic. You'll show them. You'll show them all! They will pay for their grave mistake. You merely need to use the Alloy Smelter that you had devised before to create something...new. Cupronickel, you've decided to call it. Yes, that's a perfect name. The material has a lustrous brown sheen, darker than the mere copper that you had been working with previously. Perhaps darker in more ways than just appearance, as well. The Alloy Smelter was more powerful than you had imagined, and it almost scares you. But you are its master. It has to obey your every command. And in turn, metal obeys its command. You wondered how you might utilize this newfound power, when you realized. Everything in this world is made of cubes. That is for a reason, is it not? Yes...yes, this will do nicely, you think, cackling as a devious plan hatches in your twisted head. Perhaps this material will be more capable than you had previously imagined. If you can find a way to tightly pack wires of this new material into a cube, you should be able to harness its incredible power, bending the universe to your untouchable will. Hahahahahaha...you'll show them, alright. They will die regretting the day they ever doubted you!`;

(_ => {
    let out;

    if (!tag.args) {
        out = a;
    } else {
        const input = parseInt(tag.args);

        if (isNaN(input) || input < 1 || input > 2) {
            return ":information_source: Number must be between 1 or 2.";
        }

        switch (input) {
            case 1:
                out = a;
            case 2:
                out = b;
        }
    }

    msg.reply({
        embed: {
            title: "",
            description: out
        }
    });
})();

