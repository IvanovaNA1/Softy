using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Softy.Server.Models.DbModels
{
    [Table("servicetypes")]
    public class ServiceType
    {
        [Column("id")][Key] public int Id { get; set; }
        [Column("name")] public string Name { get; set; }
    }
}
