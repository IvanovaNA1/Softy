﻿namespace Softy.Server.Models
{
    public class AddServiceModel
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string Duration { get; set; }
        public int ServiceTypeId { get; set; }
    }
}
