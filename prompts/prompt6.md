Great, now I want to add a list of my skills that is fixed to the top left corner of the page. The list  should be vertical and left aligned with a transparent background. Let's call this element "skills-list". I also have a "skills.json" file. This is the source list of my skills as well as the mapping of skills to the projects that demonstrate these skills. E.g.

```javascript
{
    "Python": ["example_1", "example_2", "example_3"],
    "Javascript": ["example_1", "example_3"],
    "HTML/CSS": ["example_1"],
    "Machine Learning": ["example_4"],
    "NLP": ["example_2", "example_3"],
    "Automated Speech Recognition": ["example_1", "example_2", "example_3"],
    "Computer Vision": ["example_4", "example_2", "example_3"],
    "Pytorch": ["example_1"],
    "Embedded Systems": ["example_3"],
    "Software Architecting": ["example_1", "example_2", "example_3"],
    "Design Patterns": ["example_1", "example_2", "example_3"],
    "DevOps": ["example_3"],
    "Teamwork & Leadership": ["example_2", "example_4"],
    "Creative Problem Solving": ["example_1", "example_3"],
    "Seeing Things Through Fully": ["example_3", "example_1"],
    "Technical Communication": ["example_2", "example_4"]
}
```

Now, what I what to accomplish is:

1. Read from this JSON and populate the skills-list element with my skills.
2. Add a hover event such that when the user hovers their mouse over the bounding box of the text for any given skill:
    - The text of the skill in the list changes color and receives a slight white glow effect.
    - The content squares that correspond to the projects that demonstrate this skill receive an blinking animated glow that eases in and out.

This way, the user (a prospective employer) can quickly see which projects demonstrate the skills that they are interested in.

Please write some thoughtful code for me that will accomplish this, given my current code.
