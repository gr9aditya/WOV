using System.Collections.Generic;

/// The demo ballot exactly as printed on the sample voting card and shown on the portal in the
/// "Explain Swiss Post E-Voting Through a Game" briefing.
///
/// A Choice Return Code exists for *every* selectable option — Ja, Nein and Leer for each
/// question, every candidate on every list, both the single and the cumulated entry, and each
/// blank slot. That completeness is the point: the voter looks their own selection up among all
/// the printed options, so the codes cannot be guessed from what is on screen.
public static class Ballot
{
    public struct Option
    {
        public string label;
        public string code;
        public bool selected;

        public Option(string label, string code, bool selected = false)
        {
            this.label = label;
            this.code = code;
            this.selected = selected;
        }
    }

    public struct Question
    {
        public string title;
        public Option[] options;

        public Question(string title, params Option[] options)
        {
            this.title = title;
            this.options = options;
        }
    }

    public struct Section
    {
        public string title;
        public Question[] questions;

        public Section(string title, params Question[] questions)
        {
            this.title = title;
            this.questions = questions;
        }
    }

    public const int DemoAbstimmung = 0;
    public const int Variantenabstimmung = 1;
    public const int Proporzwahlen = 2;
    public const int Majorzwahlen = 3;

    public static readonly Section[] Sections =
    {
        new Section("Demo Abstimmung",
            new Question("1. Sonniges Wetter",
                new Option("Ja", "1855", true),
                new Option("Nein", "0196"),
                new Option("Leer", "7064")),
            new Question("2. Regenwetter",
                new Option("Ja", "8393"),
                new Option("Nein", "2938", true),
                new Option("Leer", "2033"))),

        new Section("Variantenabstimmung",
            new Question("1a. Volksinitiative",
                new Option("Ja", "9697", true),
                new Option("Nein", "9131"),
                new Option("Leer", "7973")),
            new Question("1b. Gegenvorschlag",
                new Option("Ja", "0238", true),
                new Option("Nein", "1239"),
                new Option("Leer", "1630"))),

        // Proporz codes come in two columns: 1x is the candidate named once, 2x cumulated.
        new Section("Proporzwahlen",
            new Question("Liste 1: Komponisten/innen",
                new Option("1x", "9096", true)),
            new Question("1.1.1 Chopin Frédéric",
                new Option("1x", "4468", true),
                new Option("2x", "4563", true)),
            new Question("1.1.2 Vivaldi Antonio",
                new Option("1x", "1098", true),
                new Option("2x", "8530")),
            new Question("Liste 2: Schriftsteller/innen",
                new Option("1x", "7072")),
            new Question("1.2.1 King Stephen",
                new Option("1x", "6070"),
                new Option("2x", "6357")),
            new Question("1.2.2 Rowling Joanne",
                new Option("1x", "7428"),
                new Option("2x", "0663")),
            new Question("Kein Name ausgewählt",
                new Option("1x", "8311", true))),

        new Section("Majorzwahlen",
            new Question("2.1.1 da Vinci Leonardo", new Option("1x", "5652")),
            new Question("2.1.2 Michelangelo Buonarroti", new Option("1x", "9923")),
            new Question("2.1.3 Monet Claude", new Option("1x", "7926")),
            new Question("2.1.4 Cézanne Paul", new Option("1x", "7292", true)),
            new Question("2.1.5 Van Gogh Vincent", new Option("1x", "8094", true)),
            new Question("Kein Name ausgewählt", new Option("1x", "1288")),
            new Question("Kein Name ausgewählt", new Option("1x", "3418"))),
    };

    /// The codes the portal returns for what this voter actually selected, in ballot order.
    public static List<string> SelectedLines(params int[] sections)
    {
        var lines = new List<string>();
        foreach (int index in sections)
        {
            foreach (var question in Sections[index].questions)
            {
                foreach (var option in question.options)
                {
                    if (option.selected) lines.Add(question.title + "  " + option.label + "  " + option.code);
                }
            }
        }
        return lines;
    }
}
