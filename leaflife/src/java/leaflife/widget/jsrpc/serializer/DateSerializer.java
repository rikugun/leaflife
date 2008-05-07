package leaflife.widget.jsrpc.serializer;

import java.io.EOFException;
import java.sql.Time;
import java.sql.Timestamp;
import java.util.Date;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.MarshallException;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;


/**
 * Serializer for converting from and to Date object and JSON string.
 * @author huangchao
 */
public class DateSerializer extends AbstractSerializer
{
    private Class[] serializable_classes = new Class[] {Date.class, java.sql.Date.class, Time.class, Timestamp.class};

    public Class[] getSerializableClasses()
    {
        return serializable_classes;
    }

    public String marshall(Object obj, int level) throws MarshallException
    {
        return new StringBuffer("new Date(").append(((Date) obj).getTime()).append(')').toString();
    }

    public Object unmarshall(Tokener json, Class desired_class) throws InvalidJSONSyntaxException, UnmarshallException, InvocationException
    {
        try
        {
            if (json.nextToken() == Tokener.CHARACTERS && json.isDate())
            {
                long milliseconds = Long.parseLong(json.getTokenText());
                if (Date.class.equals(desired_class))
                {
                    return new Date(milliseconds);
                }
                else if (java.sql.Date.class.equals(desired_class))
                {
                    return new java.sql.Date(milliseconds);
                }
                else if (Time.class.equals(desired_class))
                {
                    return new Time(milliseconds);
                }
                else if (Timestamp.class.equals(desired_class))
                {
                    return new Timestamp(milliseconds);
                }
            }
        }
        catch (EOFException e)
        {
        }
        catch (NumberFormatException e)
        {
        }
        throw new UnmarshallException("206");  // can not convert JSON string to date object
    }
}
