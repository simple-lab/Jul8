﻿using System.Collections.Generic;

namespace Jul8Compiler
{
    public class Template
    {
        public string TemplateId;
        public string ClassName;
        public List<string> Controls = new List<string>();
        public List<Template> ListItems = new List<Template>();
    }
}