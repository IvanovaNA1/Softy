using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Softy.Server.Models.DbModels
{
    [Table("roles")]
    public class Role
    {
        [Column("id")][Key] public int Id { get; set; }
        [Column("name")] public string Name { get; set; }
    }
}
