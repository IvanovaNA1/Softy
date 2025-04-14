using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Softy.Server.Models.DbModels
{
    [Table("services")]
    public class Service
    {
        [Column("id")][Key] public int Id { get; set; }
        [Column("name")] public string Name { get; set; }
        [Column("duration")] public string Duration { get; set; }
        [Column("description")] public string Description { get; set; }
        [Column("price")] public decimal Price { get; set; }
        [Column("service_type_id")] public int ServiceTypeId { get; set; }
        public ServiceType ServiceType { get; set; }
    }
}

